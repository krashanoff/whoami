---
title: "Understanding Haskell Through Rust (and vice versa)"
date: 2021-10-29T00:00:00-07:00
draft: true
---

Haskell is a very strange programming language. I have never had a particular reason to
learn the language in the same way I needed Go for my clubs projects or Rust for understanding
a few open-source projects. I'm not writing any math-heavy research papers, and even then I
can't say that I'd jump to using Haskell. I had always found it a curiosity, and not much more.

Every time I have a bunch of exams queued up, though, I find that I come
around to trying to learn it, and then give up when I get to parts about monads and
all this other category theory stuff.

This October, I took another dive into it after getting burnt out writing a *lot* of
Rust. For whatever reason, this time, it made a lot more sense to me.

I think the thing that it boiled down to for me is the syntax of the
language. Yeah, it's functional, so it's pretty unfamiliar, but even if you're coming from
something like OCaml, as I was in my second year of college, it's still just *weird*.

```hs
nextToken :: [Char] -> Maybe Token
nextToken str = msum $ map (($ str) . stripToken)
  [LBracket
  , RBracket
  , LParen
  , RParen
  , Println
  , If
  , Else
  , While
  , Not
  , TTrue
  , FFalse]
```

Some of it is whitespace sensitive, some of it isn't. There's these weird infix operators
everywhere and random function names you've never seen before pop up all over the place.

Having taken a longer look at it, though, I've come to appreciate the rich grammar of Haskell.
There's a power to having a lot of different ways of doing the same thing at a fundamental level.

Which of these looks more syntactically sane to you? Or, even better, which of these
immediately demonstrates exactly what it's going to do?

```hs
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

This variety lets different *voices* come through in code in the same way it does in good writing.

This is good: focused use of Haskell's syntax leads to concise code and builds a relationship
between the author and their reader.

This is bad: brandishing its syntax can cause confusion.

Here's a good example, where we increment an optional value.

```hs
-- A naive use of case statement:
potentiallyIncrement a = case a of
  Just x -> Just (x + 1)
  Nothing -> Nothing

-- Or, using pattern matching:
potentiallyIncrement (Just x) = Just (x + 1)
potentiallyIncrement Nothing = Nothing

-- Or, using monads:
potentiallyIncrement a = a >>= (\x -> Just (x + 1))

-- Or, with currying:
potentiallyIncrement = (=<<) $ Just . (+ 1)
```

We are able to describe the action of *potentially* modifying a value under an abstraction with
Haskell's `bind` (`>>=`) operator. There are a plethora of ways of approaching it, even in this
simple example. Depending on which way one approaches it, the immediate meaning might change.

In nontrivial codebases, Haskell's grammar will cause explosions in complexity. The voice of
the author determines its maintainability -- whether it will become a bunch of `case` statements
or clever function compositions[^1]. For more complicated Haskell programs, functions can reach tens of lines.
Doesn't sound like much, except each line comes with this same exceptional information density.

## Rust Parallels

Looking over these functions after writing a ton of Rust,
I realized these semantics reminded me of a fundamental mechanic.

```rs
fn potentially_increment(u: Option<u32>) -> Option<u32> {
  u.map(|i| i + 1)
}
```

In Rust, an `Option<T>` type can have its underlying value *potentially* modified with a call to
`Option<T>::map`. Sound familiar to a certain operator?

It was when I came to this parallel that I noticed how many things in Rust are
near-direct analogs to Haskell. A `Tree` in Haskell, for example, might look like this:

```hs
data Tree a = Node (Tree a) (Tree a) | Leaf a
  deriving (Show)

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

Others have written about the more direct similarities between Haskell and Rust[^2],
but something that I think isn't talked about as much are the trade-offs Rust has made
to inherit some of their ideas beyond syntax.

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

I'd argue this drives the "flow" of the program.

While Rust does not have out of the box support for currying[^3],
it has its own sort of "flow mechanic": functional fluency. Rather than partial application of
functions generating new functions, we can partially apply attributes onto a struct
through functions, generating new partial structs.

```rs
let myfile = OpenOptions::new()
                        .read(true)
                        .write(false);
                        .open("filename.txt")
                        .unwrap();
```

This adopts a functional approach to object-oriented operations.

## Monads vs. Results + Options

I pinned down monads as a container type in the same vein as `Option<T>`. For our examples,
let's compare `Option<T>` to `Maybe`:

Operation | Rust | Haskell
:-|-|-
Wrap in container | `Some(x)` | `Just (x)`
Modify underlying value | `.map()` | `>>=`
Get first underlying value | `.iter().find()` | `msum`
Map each underlying value in an iterator | `.iter().map(|x| x.map())` | `mapM`

Where the two differ, though, is that monads are also their own `Result<T, E>`.
Rather than keeping two separate types with uniform interfaces, Haskell instead has a single
type with a single, more polymorphically powerful interface.

## Functional v. Memory Safety

In Rust, there's a powerful sense of polymorphism through its trait system. This
same trait system exists in Haskell in the form of type classes, but Haskell goes
takes some interesting liberties with the addition of Monads. Compared to Rust's
focus on safety through memory guarantees, Haskell's focus on safety is executed
through keeping code as purely functional as possible.

Both have different approaches to bubble-wrapping code, each powerful in their
own right.

[^1]: The way the author explains their programming also matters. Literate Haskell places an emphasis on this. https://wiki.haskell.org/Literate_programming
[^2]: Others have written about more direct similarities between Rust and Haskell:
      * http://xion.io/post/programming/rust-into-haskell.html
      * https://www.fpcomplete.com/blog/2018/11/haskell-and-rust/
[^3]: There is a crate for currying functions in Rust. https://peppe.rs/posts/auto-currying_rust_functions/
