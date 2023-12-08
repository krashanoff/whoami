---
title: Keyword generics seem intimidating
date: 2023-03-13T00:00:00-07:00
toc: false
---

You ever read ["What Color is Your Function"](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)? A pretty good lot of people have.

If you've worked with `async`, you know how infectious function coloring can be. If you want to write some code that can be called asynchronously, then it definitely can't be called synchronously. Or, if it can be called synchronously, it has to be done using something that feels kind of jank. Like Python:

```py
import asyncio

async def thing():
  return await some_other_thing()

if __name__ == '__main__':
  result = asyncio.run(thing)
  print(result)
```

But most of the time, the async behavior propagates up the call stack, until you have an `async` main. Or in Rust, where you have to stand up a whole runtime for it:

```rust
fn main() {
  Runtime::new()
    .unwrap()
    .spawn(async {
      println!("hi");
    });
}
```

Where function coloring is less of a problem is in langauges like Go, or languages where `suspend/resume`
is the way of doing async. In those languages, functions don't have special keywords to be considered asynchronous,
which means that any function could be instantiated like it were async.

```go
func longComputation(resultChan chan<-int) {
  resultChan <- 2
}

func main() {
  resultChan := make(chan int)
  go longComputation(resultChan) // runs asynchronously

  // we can do stuff then block on the result later
  fmt.Println("thing")
  output := <-resultChan
}
```

Rust is a modern language with a huge groundswell of support. The steering committee wants what's best for its users, so it makes sense that they would benefit from solving this problem sooner than later. The Rust project recently announced that they were planning to tackle this problem through the Keyword Generics Initiative, whose announcement you should read [here](https://blog.rust-lang.org/inside-rust/2022/07/27/keyword-generics.html). Their plan was:

> Rust allows you to be generic over types - it does not allow you to be generic over other things that are usually specified by keywords. For example, whether a function is async, whether a function can fail or not, whether a function is const or not, etc.
>
> The post "What color is your function" describes what happens when a language introduces async functions, but with no way to be generic over them...
>
> This isn't just limited to async though, it applies to all modifier keywords - including ones we may define in the future. So we're looking to fill that gap by exploring something we call "keyword generics": the ability to be generic over keywords such as const and async.
>
> *-- "Announcing the Keyword Generics Initiative"*

The tentatively proposed syntax was:

```rs
async<A> trait Read {
    async<A> fn read(&mut self, buf: &mut [u8]) -> Result<usize>;
    async<A> fn read_to_string(&mut self, buf: &mut String) -> Result<usize> { ... }
}

/// Read from a reader into a string.
async<A> fn read_to_string(reader: &mut impl Read * A) -> std::io::Result<String> {
    let mut string = String::new();
    reader.read_to_string(&mut string).await?;
    string
}
```

To me, this seems unwieldy, but at least comprehensible: we're generalizing the function over the `async` keyword itself, and introducing some strange syntax in order to specify whether a type fulfills that optional `async/await`-ness. Just another little nugget of Rust syntax to notch onto the belt.

But, the working group recently released [a new update on the project](https://blog.rust-lang.org/inside-rust/2023/02/23/keyword-generics-progress-report-feb-2023.html). After nine months, the proposed syntax is a _little_ different.

```rs
trait ?async Read {
    ?async fn read(&mut self, buf: &mut [u8]) -> Result<usize>;
    ?async fn read_to_string(&mut self, buf: &mut String) -> Result<usize> { ... }
}

/// Read from a reader into a string.
?async fn read_to_string(reader: &mut impl ?async Read) -> std::io::Result<String> {
    let mut string = String::new();
    reader.read_to_string(&mut string).await?;
    Ok(string)
}
```

I know this is still relatively early in the lifetime of the project, but I can't say I'm enthused with this. In fact, this syntax kind of makes me anxious.

At least in the case of `async<A>`, it is pretty apparent that it's an extension of the generics system in Rust, which is what they were going for in the first place. With this new `?async`, though, the feature presents itself syntactically as an extension of the error propoagation system (e.g., `result?.do_thing()`) or the trait bound system (e.g., `fn_name<T: TraitName + ?Sized>()`). Neither of these lend themselves to keyword _generics_. I'd be curious about how this approach would scale to keywords like `const`. The Rust userbase is getting larger, too, so I'd be curious about how this approach would get introduced to the stable release. These problems remind me a little bit of a certain postincremented language.

And the language is already _really_ gnarly in its syntax. This snippet would kill a programmer from the 80s, and it's not even using lifetime bounds to their full extent:

```rs
/// This is a comment that has special meaning.
#[derive(Debug, Deserialize)]
#[serde(rename_all(deserialize = "kebab-case"))]
struct Thing<'a, T> {
  /// This one, too
  on_loan: &'a T,
}

impl<'a, T> Thing<'a, T>
  where T: Clone + Into<String>
{
  pub async fn use_thing(thing_one: &mut Thing<'a, T>) -> String {
    thing_one.on_loan.clone().into()
  }
}
```

I realize this is an unfair observation. Any language can look gnarly when you're fishing for an example of how incomprehensible it can be. But, in the case of Rust, it can be pretty easy to find said examples. In any case, I'm not sure where I'm going with this one other than "it seems like learning Rust as a complete beginner is only going to get harder and harder going forward," and, "I hope Rust doesn't evolve into the very thing it sought to destroy".

And with that, I'll leave the reader with some interesting reads on Rust's function coloring problem that can be readily organized into the [five stages of grief](https://www.washington.edu/counseling/2020/06/08/the-stages-of-grief-accepting-the-unacceptable/), ignoring their dates of publication:

1. Denial, "Rust's async isn't colored!": https://www.hobofan.com/blog/2021-03-10-rust-async-colored/
2. Anger, critique of async Rust: https://eta.st/2017/08/04/async-rust.html
3. Bargaining, "Colored functions are good, actually": https://www.thecodedmessage.com/posts/async-colors/
4. Depression, a follow-up to said critique: https://eta.st/2021/03/08/async-rust-2.html
5. Acceptance, "Rust's async is colored, and that's okay": https://morestina.net/blog/1686/rust-async-is-colored

