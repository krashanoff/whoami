---
title: Using Google's Common Expression Language in Postgres
date: 2024-02-01T21:35:00-07:00
---

As a disclaimer, the following is not intended as a code-complete example. I gloss over some
low-level details, but tried to keep enough context so the reader can follow along. I may
update this page with more code snippets or publish the complete source after cleaning it up,
but for now it shall live as a brief discussion.

# Introduction

You may already have some familiarity with Google's [Common Expression Language (CEL)](https://github.com/google/cel-spec).
It is the language that drives things like the [Log Explorer's search feature](https://cloud.google.com/logging/docs/view/building-queries).
In brief, it evaluates
expressions like `someIntVariable <= 4 && someIntVariable in someListVariable` within an evaluation
environment. It was designed for use in performance-critical application paths, and is intentionally
Turing incomplete.

I have been living in Postgres for the past week, and thought that user-supplied conditions for
filtering criteria would be a perfect use case for a high-performance expression language. For example,
consider the following schema:

```sql
CREATE supported_location AS ENUM ('us', 'ca', 'intl');

CREATE TABLE user (
  id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255),
  location_name supported_location
    NOT NULL DEFAULT 'us'::supported_location,
  last_active TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE object (
  id INT PRIMARY KEY,
  visible_if TEXT
);
```

Say we want to insert an object that is only visible to users in the United States (i.e.,
`user.location_name = 'us'`), and whose name starts with the letter 'a'. If we pass the row
containing the user we are querying on the behalf of as a parameter `user`, then we could
express this condition in Google's CEL as:

```plaintext
user.location_name == "us" && user.name.startsWith('a')
```

Then, we would be able to query for all objects the current user can read through something
like:

```sql
WITH current_user_tuple AS (
  SELECT *
  FROM user
  WHERE id = 1
)
SELECT *
FROM object o
WHERE
  o.visible_if IS NULL OR
  evaluate_cel(o.visible_if, current_user_tuple)
;
```

We could express this in pure SQL through use of a set of join tables, but this approach is
more accommodating to any custom conditional logic that users may want to create. Say
in the above example we also wanted the object to only be visible only if the user was
last active in December. Assuming we pass the column `last_active` as a proper protobuf
timestamp, we can take advantage of the [built-in helpers](https://github.com/google/cel-spec/blob/master/doc/langdef.md#list-of-standard-definitions)
and write:

```plaintext
user.location_name == "us" &&
user.name.startsWith('a') &&
user.last_active.getMonth() == 11
```

The query wouldn't need to change at all, only the contents of the `visible_if` column in the
object's row.

```sql
UPDATE object
SET visible_if = '...the expression...'
WHERE id = 1;
```

This is especially valuable when users are expected to be providing the input: as long as we
don't expose any dangerous custom functions to the evaluation context and Google
implemented the language evaluator correctly, there's no need to sanitize user input.

So, to spell out our goals clearly, we want to provide a way for PostgreSQL to evaluate Google
CEL expressions by exposing a user-defined function (UDF).

# Writing the function

## Postgres' user-defined functions

[Postgres provides a way of writing custom functions in C.](https://www.postgresql.org/docs/current/xfunc-c.html)
A simple example looks like:

```c
#include "postgres.h"
#include <string.h>
#include "fmgr.h"
#include "utils/geo_decls.h"
#include "varatt.h"

PG_MODULE_MAGIC;

PG_FUNCTION_INFO_V1(returns_true);

Datum
returns_true(PG_FUNCTION_ARGS)
{
    PG_RETURN_BOOL(1);
}
```

This means that if we expose CEL as a simple wrapper around its [C++ implementation](https://github.com/google/cel-cpp)
as a shared object, then Postgres will be able to use it.

## Making sense of Google's code

The source for CEL is classic Google.[^classic] It uses [Abseil](https://github.com/abseil/abseil-cpp) and provides
any documentation inline with the code -- in my experience, usually you have to hunt around through
random files for the right function or data type on initial read. Because it uses an atypical build system,
Intellisense can't pick up symbols for autosuggest.[^intellisense]

[^classic]: From what I've read, at least, in Google's WebRTC repo prior.

[^intellisense]: It uses Bazel, as I discuss later in the post. I'm sure there's some trick to this
that I am missing, or [some extension and toolchain](https://github.com/grailbio/bazel-compilation-database) I need to set up in my editor, but no matter! People wrote code without autocomplete for decades.

Thankfully, the developers have included a Codelab in the repo. Copying their
example in the first Codelab entry, we can write up a quick function to evaluate an expression.
The following example elides much information, but it can be found nearly verbatim
in [`exercise1.cc` in the Codelab](https://github.com/google/cel-cpp/blob/master/codelab/solutions/exercise1.cc).

```cpp
InterpreterOptions options;
auto builder = CreateCelExpressionBuilder(options);
RegisterBuiltinFunctions(builder->GetRegistry(), options);

protobuf::Arena arena;
Activation activation;

// TODO: populate activation with various `CelValue`s...

// Assumes expression has already been parsed.
CEL_ASSIGN_OR_RETURN(CelValue result,
  expression_plan->Evaluate(activation, &arena));

bool bool_result = false;
result.GetValue<bool>(&bool_result);
return bool_result;
```

From here, we have the scaffold for our Postgres function:

```cpp
// All the Google includes, pretty much anything
// in the /public folders...

absl::StatusOr<bool> Evaluate(absl::string_view expr);

#ifdef __cplusplus
extern "C" {
#endif

#include "postgres.h"
#include <string.h>
#include "fmgr.h"
#include "utils/geo_decls.h"
#include "varatt.h"

PG_MODULE_MAGIC;

PG_FUNCTION_INFO_V1(evaluate_cel);

Datum
evaluate_cel(PG_FUNCTION_ARGS)
{
    /* Convert the args to a friendlier data type. */
    /* Return the result of calling Evaluate. */
}

#ifdef __cplusplus
}
#endif

absl::StatusOr<bool> Evaluate(absl::string_view expr) {
  /* Do the conversion. */
}
```

# Building the extension

In my experience usually the trickiest parts of any sufficiently complicated C++
application are:

1. Building it for yourself
2. Building it for other people

When I first tried building a WebRTC native C++ application locally, for example, I really
struggled with using their toolchain to compile everything. I ended up having to build my
software in-tree. CEL wasn't as bad as WebRTC because it uses
[Bazel](https://bazel.build/) instead of Chromium's [gn](https://gn.googlesource.com/gn/+/main/docs/reference.md).

I tried a few different approaches building the C-compatible Postgres extension.

## Approach #1: do it all in Bazel

Neglecting to read Bazel's docs carefully, I originally thought I could get by with just building a
shared library in Bazel by adding it as a target. I would then load this into the database.

```bazel
cc_library(
  name = "pg_test",
  srcs = [ ... ],
  deps = [
    "@libpq//:all",
    "@cel//...:...
  ],
)
```

This required a dependency on `libpq` that was established through an [`http_archive`](https://bazel.build/rules/lib/repo/http#http_archive) target in the
`WORKSPACE` file to get the files, and a [`configure_make`](https://bazelbuild.github.io/rules_foreign_cc/main/configure_make.html) target established in the `BUILD` file. I tried
this a few times but eventually conceded and just shoved in some extra directories to the target's `include`
property. This is acceptable, since the headers are just there for declarations. This attempt did not
build, though, since the declarations in Postgres' library were missing their corresponding declarations from
the perspective of Bazel's sandbox during the build.

## Approach #2: do half of it in Bazel, and the rest in Make

For my second try, I did half of it in Bazel by attempting to build a statically linked wrapper library
around CEL, then linking that to my Postgres user-defined function and building a shared object from it.
For example, we'd build the C++ library with some headers like:

```cpp
#ifdef __cplusplus
extern "C"
#endif
bool Evaluate(const char *expr);
```

Then move all the Postgres module functionality to its own, separate file for use as _another_ library:

```c
#include "postgres.h"
#include <string.h>
#include "fmgr.h"
#include "utils/geo_decls.h"
#include "varatt.h"

#include "my_cel_wrapper_lib.hh"

PG_MODULE_MAGIC;

PG_FUNCTION_INFO_V1(evaluate_cel);

Datum
evaluate_cel(PG_FUNCTION_ARGS)
{
    /* Convert the args to a friendlier data type. */
    /* Return the result of calling Evaluate. */
}
```

My `Makefile` for the C portion looked something like:

```makefile
default:
  $(CC) $(CFLAGS) $(LFLAGS) \
  -shared -fPIC \
  path/to/archive/output.a \
  -o my_postgres.so \
  my_postgres.c
```

I plugged in a bunch of flags to the Bazel library target to try and get a fully-statically linked
archive file, too:

```bazel
cc_library(
  # ...
  linkopts = ["-static", "-fPIC"],
  copts = ["-static"],
  # ...
)
```

And then the build process was a simple `bazel build && make`. This worked to output a shared object, but when
I tried to load it into Postgres, the database would complain about a missing symbol! How mysterious that a
library I had told Bazel explicitly to link statically, would be missing a symbol at compile time
of my second wrapper library!

We can investigate which symbols are missing with `nm`. The exact command I was using was
`nm -gU path/to/output.a | grep -E '[0-9]+ V.+'` in order to find symbols that had been
marked as `V`.[^nm] Indeed, _almost all of the symbols from cel-cpp were weak objects_.

[^nm]: Any symbol marked as a weak object. See: <https://linux.die.net/man/1/nm>.

I didn't want to hack together an even more gross solution by catching the exact command from Bazel with
the `-s` flag, so I decided to abandon this approach and try, once again, to use Bazel as much as I could.

## Approach #3: do it all in Bazel (again)

The astute reader likely instantly noticed my flaw in approach #1.
Returning once again to the Bazel documentation for C/C++ targets, I found that I had been using the wrong one from
the get-go. Instead of [`cc_library`](https://bazel.build/reference/be/c-cpp#cc_library) to build a shared object, I needed to use a [`cc_binary`](https://bazel.build/reference/be/c-cpp#cc_binary) type with the
`linkshared` option set.

To resolve the issue of building Postgres consistently, I resorted to simply throwing the header files that
we'd pull in from Postgres into a folder, and mass-renaming their include paths so that they respected their
installed location. I should note that this is **not maintainable at all!** It relies heavily on the Postgres
headers' installed hierarchy being pure, such that anything in the `server` folder does not depend on anything
in a parent folder. As of this writing while using Postgres 16, this was not an issue, but it could change in
the future! My primary motivation in taking this hacky route was to just build something that works first, then
clean up the approach later if it performed well.

```bazel
cc_library(
  name = "pg_test",
  linkstatic = 1,
  linkshared = 1,
  srcs = [
    "libpq/include/server/**/*.h",
    "my_file.hh",
    "my_file.cc",
  ],
  deps = [
    "@cel//...:...,
  ],
)
```

Finally, running `bazel build`, I was able to get an `.so` file that had no weak objects, and loaded
into my database properly with:

```sql
CREATE FUNCTION evaluate_cel(TEXT) RETURNS BOOLEAN
     AS '/path/to/my/file.so', 'evaluate_cel'
     LANGUAGE C STRICT;
```

Note that the signature accepts a single `TEXT` parameter, but my earlier use case took two. This is
because this particular implementation was just a smoke test to see what the cost would be to run the
CEL code in a `JOIN` or `WHERE` clause.

# Conclusions

## Performance measurements

Now that I had my binary, I did some really rough performance measurements to see how the
function would perform. I created a simple table and populated it with a couple dozen rows.
Querying against one row alone with a simple expression, I saw about a 75-100ms query time
increase. Against each row with a `SELECT * FROM SomeTable WHERE evaluate_cel('...')`, I
saw about 100ms of delay per-row.

Given more time, I anticipate I'd find the significant and consistent overhead here is
from setting up the allocation arena and parser object, then building the AST and execution plan for
the expression. Building a simple command line C program with the library had a similar "warm-up"
time compared to its lightning fast parse time, so I think I'm at least near the money in this
estimate, if not on it.

We could improve performance by doing the parsing ahead of time and writing it
into another database column. To make this more ergonomic, we could add a
[trigger function](https://www.postgresql.org/docs/current/plpgsql-trigger.html) to build the
expression's AST, then store the result back into a column as some `BYTEA` or similar. This would
be borderline dark arts, though.

A more effective approach would be to keep the arena in shared memory, and cache common expressions
. This could be accomplished through use of Postgres'
[`RequestAddinShmemSpace`](https://www.postgresql.org/docs/current/xfunc-c.html#XFUNC-SHARED-ADDIN),
or some other mechanism like caching in Redis, since, to my knowledge, a C-language UDF can execute
arbitrary code. A Redis plugin for Postgres, [imagine that :)](https://github.com/pg-redis-fdw/redis_fdw)

## Portability and deployment considerations

There are many downsides to this approach that make me think twice about investing too much time
into it:

* Since this is compiled to a shared object, it must be compiled to the same architecture as the
  database host.
* In managed Postgres instances (e.g., AWS RDS, GCP Cloud SQL), it may be difficult or impossible to
  install unvetted extensions.
  * Even in Postgres instances that are self-hosted, you may still have to really work on your company admin to let
    you add this.
* The build toolchain may be orthogonal to other technology you use in your stack.
* This example ignored any discussion of converting to and from Postgres and CEL's data types in the adapter
  function. This could be an area with some nasty edge cases.
* Even if the function is written carefully, undefined behavior abounds. A crash in a function this
  close to the surface of the database could be dangerous.
  * To this end, using entirely unsanitized user input will always pose a danger in any
    code near your data model.

Although this approach is pretty impractical and requires some reasonable lifting for performance
optimization, it's also very cool that it works at all. The ergonomics at the data model level make
it possible to eliminate lots of extra joins on bespoke tables for user-defined filtering criteria.
