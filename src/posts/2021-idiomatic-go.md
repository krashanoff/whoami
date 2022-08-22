---
title: "Idiomatic Semantics in Golang"
date: 2021-11-08T00:00:00-07:00
tags:
  - software
  - thoughts
---

I have a complicated relationship with Go as a programming language. There’s a lot at its disposal , but only at expense of throwing oneself at the mercy of the language designers. What I want to talk about is a very particular part of Go that they like to stress as a coding methodology adopted into the language itself: idiomatic semantics.

A while back, when I was starting to learn Go, I stumbled onto this answer on StackOverflow referencing the Golang FAQ[^1].

> The reason [the ternary operator] is absent from Go is that the language's designers had seen the operation used too often to create impenetrably complex expressions. The if-else form, although longer, is unquestionably clearer. A language needs only one conditional control flow construct.

Let me emphasize a particular point here that I think really stands out to me:

> ...the if-else form, although longer, is unquestionably clearer...

I think that’s the big selling point of Go as a programming language. The syntax strives to be idiomatic and easy-to-read, and the official toolchain isn’t afraid to enforce the shit out of this principle even if it means inflating your LOC and making your code a little more verbose than it needs to be. Terseness is secondary: good code in Go's eyes is code that you read once, write once, and can immediately grasp.

```go
// From: github.com/uclaacm/teach-la-go-backend

// RequestBodyTo reads the request body and marshals it into
// the interface described by i.
func RequestBodyTo(r *http.Request, i interface{}) error {
	if err := json.NewDecoder(r.Body).Decode(i); err == io.EOF {
		return nil
	} else {
		return err
	}
}
```

This is one of those things that -- while I was learning Go -- I had wished the language didn’t take so strongly to. Now that I’ve spent more time with the language, though, and worked on some larger projects, I’ve come to a point where I feel comfortable talking about these design decisions and how they reflect on everything else. You see...

## Go wants to force you to write code the designers like.

I think that this is the paradigm that makes everyone so uneasy. We aren’t presented with the amount of rigidity introduced to Go in any programming language that I know of, except for maybe Scratch, but that’s hardly a use case.

So what was going through the designers’ heads? And where the hell is my ternary? Look to the language designers’ presentations at SPLASH 2012 for some more context -- specifically, slide 10[^2]:

> “My favorite feature isn’t in Go! Go Sucks!”
>
> This misses the point.

A project with similar ideals can be found in [Prettier](https://prettier.io/docs/en/why-prettier.html):

> “By far the biggest reason for adopting Prettier is to stop all the on-going debates over styles.”

This is analogous to what Go does at a language level. Its language design -- and its appropriately unforgiving linter -- solve problems of maintainability at the source. Rather than concern oneself with what good code looks like, one writes code that will meet some bare minimum threshold of quality enforced by the axioms of the language itself. As with any language, it’s still possible to write unmaintainable spaghetti:

```go
type MyDB = map[string]map[string]map[string]string

func getValue(db *MyDB, username string) string {
  if db == nil {
    return ""
  } else if db["users"] == nil {
    return ""
  } else if {
    // ...
  }
  return db["users"]["names"][username]
}
```

...Go just tries to make that as painful a process as possible.

## Where is my ternary?

Well, it isn't there. It's gone forever in Go. They threw it out because it was deemed unclear or confusing. Let’s go through a few features that **C and C++ have, but Go doesn’t.** I want you to glance through them and think about which features you absolutely loved having.

* Ternary operator
* “”””Macros””””
* `NULL`, `nullptr`, and `MY_LIBRARY_NULL`
* `typedef __something something;`
* `template<typedef T>`
* `retType MyClass::fnName()`, and generic class member functions.
* `std::thread`[^3] vs. `std::async`[^4] vs. `boost`[^5]

The two features that I personally noticed learning Go were the lack of a ternary operator and the lack of generics. However, the more Go I wrote, the less I found myself falling back on them. In place of ternary, one can use `if/else`. Sure, it's at least five lines after `gofmt`, but it reads idiomatically. In place of generics, we can use interfaces, which are implicitly implemented -- a far more flexible compromise than static assertions for polymorphic ""type bounds"".

This wasn't just in code I was writing while learning. Suddenly, contributions to Go projects were easier to read, even if they were authored by someone who started learning Go last week. Suddenly, errors were being managed and useless variables were being pruned not necessarily because programmers are keeping an eye out for them, but because *the program won't even compile without addressing them*. Mix this with Go's emphasis on test-driven development, and source is enforcably safer.

The Go programming language was designed by Google engineers who expect to write and maintain codebases with SLOC in the tens of thousands to drive complex systems in the highest-demand environments.

Writing code the designers like might not be so bad after all.

[^1]: https://stackoverflow.com/a/60561838 referencing https://golang.org/doc/faq#Does_Go_have_a_ternary_form
[^2]: Rob Pike. Go at Google. https://talks.golang.org/2012/splash.slide#10
[^3]: C++'s `std::thread`. https://en.cppreference.com/w/cpp/thread/thread
[^4]: C++'s `std::async`. https://en.cppreference.com/w/cpp/thread/async
[^5]: Boost's async ecosystem. https://www.boost.org/doc/libs/1_35_0/doc/html/boost_asio/design/async.html
