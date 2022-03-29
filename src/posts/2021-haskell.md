---
title: "Understanding Haskell Through Rust (and vice versa)"
date: 2021-10-29T00:00:00-07:00
draft: false
layout: layouts/post.njk
---

Haskell is a very strange programming language. I have never had a particular reason to
learn the language in the same way I needed Go for my clubs projects or Rust for understanding
a few open-source projects. I'm not writing any math-heavy research papers, and even then I
can't say that I'd jump to using Haskell. I had always found it a curiosity, and not much more.

Every time I have a bunch of exams queued up, though, I come around to trying to learn it, and
then give up when I get to parts about monads and all this other category theory stuff.

This October, I took another dive into it after getting burnt out writing a *lot* of
Rust. For whatever reason, this time, it made a lot more sense to me.

## Learning Struggles

I think the thing that it boiled down to for me while struggling to learn is the syntax of the
language. Yeah, it's functional, so it's pretty unfamiliar, but even if you're coming from
something like OCaml, as I was in my second year of college, it's still just *weird*.

There's a lot of different ways of doing the same thing at a fundamental level.

Which of these looks more syntactically sane to you? Or, even better, which of these
immediately demonstrates exactly what it's going to do?

```haskell
prefix = "hi there "

sayHi name = putStrLn (prefix ++ name)    -- (1)
sayHi name = putStrLn $ prefix ++ name    -- (2)
sayHi = putStrLn . (prefix ++)            -- (3)
```

All of these functions typecheck. All of them do the same thing: they apply some prefix to
a string, then print it.

```
Prelude> sayHi "reader"
hi there reader
```

Some of the examples use currying (`3`), some don't. Some use an entire
operator for simply applying parameters to a function (`2`), another composes functions (`3`).

Like natural language, there's always more than one way to say the same thing when programming.
In Haskell, there's even more. It gives the programmer a lot more creative freedom about how they
want to express their ideas without sacrificing functionality.

This is good: focused use of Haskell's syntax leads to concise code and builds a relationship
between the author and their reader.

This is bad: brandishing its syntax can cause confusion. This is what gave me a lot of trouble while
familiarizing myself with its grammar. Once you get over the initial hump, though, writing software
becomes even more creative.

Here's another example, where we increment an optional value.

```haskell
-- Using a case statement:
possiblyIncrement a = case a of
  Just x -> Just (x + 1)
  Nothing -> Nothing

-- Using a lambda case statement:
-- You have to turn this on with '{-# LANGUAGE LambdaCase #-}'.
possiblyIncrement = \case
  Just x -> Just (x + 1)
  Nothing -> Nothing

-- Or, using pattern matching:
possiblyIncrement (Just x) = Just (x + 1)
possiblyIncrement Nothing = Nothing

-- Or, using monads:
possiblyIncrement a = a >>= (\x -> Just (x + 1))

-- Or, with currying:
possiblyIncrement = (=<<) $ Just . (+ 1)
```

We are able to describe the action of *potentially* modifying a value under an abstraction with
Haskell's `bind` (`>>=`) operator. There are a plethora of ways of approaching it, even in this
simple example. Depending on which way one approaches it, the immediate meaning might change.

In nontrivial codebases, the voice of the author determines its maintainability -- how terse it
will be. For more complicated Haskell programs, functions can reach tens of lines. Doesn't sound
like much, except each line comes with this same exceptional information density.

## Rust Parallels

Looking over these functions after writing a ton of Rust, though, I realized these semantics reminded me
of a fundamental example.

```rs
fn potentially_increment(u: Option<u32>) -> Option<u32> {
  u.map(|i| i + 1)
}
```

In Rust, an `Option<T>` type can have its underlying value *potentially* modified with a call to
`Option<T>::map`. This may sound similar to the `bind` operator.

It was when I came to this parallel that I noticed how many things in Rust are near-direct analogs to
Haskell. A `Tree` in Haskell, for example, might look like this:

```haskell
data Tree a = Node (Tree a) (Tree a) | Leaf a
  deriving (Show)

valAt (Leaf v) = Just v
valAt _ = Nothing

instance Eq a => Eq (Tree a) where
  (==) a b = valAt a == valAt b
```

Compare this to a Rust data structure that I've coerced to appear as similar as possible:

```rs
#[derive(Debug)]
struct Tree<T: Eq> {
  left: Option<Tree<T>>,
  right: Option<Tree<T>>,
  value: Option<T>,
}

impl std::cmp::PartialEq for Tree {
  type Rhs = Tree;

  fn eq(&self, other: &Rhs) -> bool {
    todo!()
  }
  fn ne(&self, other: &Rhs) -> bool {
    todo!()
  }
}
```

The Haskell version is the same structure expressed tersely, in exchange for a
less-intuitive grammar.

When I realized the parallel between these two, things gradually started to click.
Rust paradigms are generally Haskell paradigms expressed in a more imperative way.
That is, Rust is a scaffold between the safety of the functional world and the
familiarity of the imperative, at expense of verbosity.

Others have written about the more direct similarities between Haskell and Rust[^1],
but I'd like to quickly talk about two trade-offs Rust has made to inherit some of their
ideas beyond syntax.

## Currying and Fluency

Haskell is built around currying. Applying a parameter to a function produces a new
function that simply takes one less parameter:

```
Prelude> :t (+)
(+) :: Num a => a -> a -> a
Prelude> :t (+ 2)
(+ 2) :: Num a => a -> a
```

This has a number of useful applications, though my most common exposure to it was
through function declarations that are simply chains of others:

```
Prelude> :t (=<<)
(=<<) :: Monad m => (a -> m b) -> m a -> m b

Prelude> potentiallyIncrement = (=<<) $ Just . (+ 1)
Prelude> :t potentiallyIncrement 
potentiallyIncrement :: Num b => Maybe b -> Maybe b
```

I'd argue this drives the "flow" of the code.

While Rust does not have out of the box support for currying[^2],
it has its own sort of "flow mechanic": functional fluency. Rather than partial application of
functions generating new functions, we can partially apply attributes onto a struct
through functions, generating new partial data structures.

```rs
let myfile = OpenOptions::new()
                        .read(true)
                        .write(false);
                        .open("filename.txt")
                        .unwrap();
```

This adopts a functional approach to object-oriented operations.

## Monads vs. Results + Options

I pinned down monads as a container type in the same vein as `Option<T>`. Let's compare
`Option<T>` to `Maybe`:

Operation | Rust | Haskell
:-|-|-
Wrap in container | `Some(x)` | `Just (x)`
Modify underlying value | `.map()` | `>>=`
Get first underlying value | `.iter().find()` | `msum`
Map each underlying value in an iterator | `.iter().map(|x| x.map())` | `mapM`

Where the two differ is that monads are also their own `Result<T, E>`. The ubiquitous `IO` monad
is an example of this[^3].

Rather than keeping two separate types with uniform interfaces, Haskell instead has a single
type with a single, more polymorphically powerful interface.

In the same way that I came to appreciate Rust after an initial hurdle,
I'm starting to understand why Haskell is well-liked by its developers. It just took
a small change in perspective.

[^1]: Others have written about more direct similarities between Rust and Haskell:
      * http://xion.io/post/programming/rust-into-haskell.html
      * https://www.fpcomplete.com/blog/2018/11/haskell-and-rust/
[^2]: There is a crate for currying functions in Rust. https://peppe.rs/posts/auto-currying_rust_functions/
[^3]: https://hackage.haskell.org/package/base-4.9.1.0/docs/System-IO.html
