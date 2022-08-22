---
title: "Protobufs, QUIC, Rust, and Qt"
date: 2022-04-07T21:34:15-08:00
tags:
  - software
  - server
---

What if we wrote an open-source Discord?

I was trying to write a small communication client/server for my girlfriend and I in my spare time.
We would just use it for text chat or voice chat. At the beginning, I didn't have much of a purpose for
writing it aside from running away from Discord after they started talking about NFTs, but I eventually
made it my goal to make it as intricate as possible - a polyglot project. I never actually finished it,
but it left me with lessons in working with intricate software.

For an application that might transport things like photos, videos, or voice communications,
security is pretty paramount. One aspect of security is *whose hands the data is in*. For
my purposes of chatting with friends, family, etc., I'd like to keep it in my own. This meant the
servers would be self-hosted, and should be designed with this in mind. I have been writing a
lot of Rust, so I figured I would write the server in Rust. To keep the code easy-to-maintain,
I would make the server async.

I also wanted the client applications to be performant. There isn't much wiggle room on this
front. Pretty much the only good-looking, non-web-based GUI framework these days is Qt, which
only *really* works if you're writing your application in C++ (although there are some high-quality
bindings to other programming languages).

Rust and C++ serialization formats don't exactly play well together, though. This meant I needed a
lingua-franca for the two to communicate with one another on the wire. I
settled on QUIC-transported protobufs for speed and security. The rest of this entry will be some
thoughts on how I built this toolchain on Windows and Mac, and the hardships I encountered throughout.

## On QUIC

Choosing QUIC was a good call. QUIC is secure by default and designed with speed in mind. It enforces use of
TLS, and keeps things speedy by modeling network communications between computers as multiple simultaneous, uni-or-bidirectional
streams over a UDP "connection". Since packets don't need to all be delivered in order, multiple streams can
be processed concurrently. This gave me a lot of freedom in how I modeled the endpoints
for communication between client and server.

I treated the server as though it were a single endpoint, where each stream ID per-client dictated the type of traffic
involved. This proved to be more of a headache than I thought, as QUIC streams aren't exactly opened and
closed like TCP sockets, but instead treated like green threads. You won't get a specific ID unless you
ask explicitly for it. This is why QUIC is superior to TCP, but also what makes it more complex.

The big thing I didn't anticipate is that **QUIC has weird libraries!** QUIC is a protocol that was designed
to be testable, which means that all the libraries out there are Bring Your Own IO. The problem with this is that
libraries are pretty pigeonholed into working something like this:

[![](https://mermaid.ink/img/pako:eNqdkr9OAzEMxl8l8lSk8gI3VELAwIgQ2y1W4juiXuw0cVqhqu9OruQqEB2ADBn8ff75y58jWHEEHWTaFWJLDx7HhKFnU1fEpN76iKzmLsafxefXp_vP6iQSDTrjefDstTSCmftuN5u6dyaR3Q9JwurmuzhTzir5Pbk6wG5JF8ssXjwxiaWcr1mWIdfQI6lhOtRwVoLn8dzRIPkXlJYerRqVStKDpO31QUwJ9XKI_OeIUnSU_0bMxE5l9bW1XXUVYA2BUkDv6nMf53IP-kaBeqgwcDRgmbSHnk_VWqKr53h0XiVBN-CUaQ1YVF7e2UKnqdBial-muU4fqdK4sQ)](https://mermaid.live/edit#pako:eNqdkr9OAzEMxl8l8lSk8gI3VELAwIgQ2y1W4juiXuw0cVqhqu9OruQqEB2ADBn8ff75y58jWHEEHWTaFWJLDx7HhKFnU1fEpN76iKzmLsafxefXp_vP6iQSDTrjefDstTSCmftuN5u6dyaR3Q9JwurmuzhTzir5Pbk6wG5JF8ssXjwxiaWcr1mWIdfQI6lhOtRwVoLn8dzRIPkXlJYerRqVStKDpO31QUwJ9XKI_OeIUnSU_0bMxE5l9bW1XXUVYA2BUkDv6nMf53IP-kaBeqgwcDRgmbSHnk_VWqKr53h0XiVBN-CUaQ1YVF7e2UKnqdBial-muU4fqdK4sQ)

There were a few libraries that handle the IO for you, but there really weren't
enough **high-level, easy to use libraries** out there in the same way that there are for protocols like RTMP.
There's Amazon's `s2n`, but the library doesn't allow the user a great degree of control over the granularity of parallelism,
favoring a massively-parallel green-thread approach. The best one riding that fine line that I found was Cloudflare's `quiche`, although this too had its shortcomings[^4] in the form of C-friendly event-loop-style packet processing.

Quiche aside, I played around with almost *every major QUIC library* just to get a feel for how they worked. I tried MsQuic and Quiche on my GUI;
Quiche, Quinn, and s2n on my Rust backend; quic-go on a tiny little Go client for testing; and aioquic on another
Python client that I built for testing. Overall, it was an insane amount of work for what felt like minimal payoff
when I just came back to using Quiche. Here are a few thoughts on each of these, though:

Name | Language(s) | Review
-|-|:-
[Quiche](https://github.com/cloudflare/quiche) | Rust, C/C++ | Good, but verbose
[Quinn](https://github.com/quinn-rs/quinn) | Rust | Where's the *real* entry point for the library?
[s2n](https://github.com/aws/s2n-quic) | Rust | Good, but maybe a little *too* abstract. Almost every single part of the library is carried out on its own async task.
[quic-go](https://github.com/lucas-clemente/quic-go) | Go | Easy to use
[aioquic](https://github.com/aiortc/aioquic) | Python | Confusing
[MsQuic](https://github.com/microsoft/msquic) | C/C++ | OK, but the use of a function table and registry is confusing

## On Protobufs

Again, the right call was protobufs. The serialization format is well-defined and easily interoperable
with other languages like Python and Go. There are also unofficial extensions to allow protobufs to
operate within Rust.

*Deploying* protobufs was a little more trouble than I thought it would be, though -- especially on Windows.
When I was building the library, I had to sit there and agonize about which linker I was using.
After pulling your hair out over which linker is the same one that Qt is using, then you have to find out
whether the linker is building the library multithreaded or not, then override flags in the Qt Makefile
configuration to fix the link issue.

In my case, protobufs was being built singlethreaded, but my Qt application was not. I wanted to
statically-link the library, though, so I disabled the multithreaded linking.

## On Async Rust

My initial architecture for the Rust-based server was programmatically intuitive, at expense
of design complexity. Each time the server received a connection, it spawn
off a data structure to handle future requests from the client. The structure can send the "conductor"
messages through its transmitting MPSC channel, and handle incoming messages through its receiving channel.
Then when we need to talk to the individual client from the conductor, we fetch its sender handle.

This established a strong separation of concerns and was motivated by the idea of ensuring that the bottleneck for the program was in the QUIC
state manager - not the database operations or global state updates. Frogs could handle the
operation requested by the client on their own time, then send the messages back to the
`Bullfrog` to relay.

Something that I overlooked when building this though was the overhead from the async runtime.
All those channels moving data across thread boundaries is *expensive*, even for something in
Rust. Two great quotes came to mind while I was building this ridiculously complicated setup.

> Think of it this way: threads are like salt, not like pasta. You like salt, I like salt, we all like salt. But we eat more pasta.
>
> — Larry McVoy[^2]

> A computer is a state machine. Threads are for people who can't program state machines.
>
> — Alan Cox[^2]

The second one really started to stick with me when I went back to review the architecture of
the server source given in the official Quiche examples. Their server is a simple state machine.
I tried refactoring mine to reflect this, but managing futures for database transactions proved
a headache.

In an unexpected turn, I settled on using Amazon's `s2n-quic` and its massively-parallel approach.
It was just easier to use, but the problem was that maintaining shared state became expensive for the
same reasons I encountered in my original approach.

## On Qt

Qt is pretty much the only GUI framework that isn't web-based. I like the ideas presented by projects like iced or yew, but they are still, ultimately, web technologies. I don't really wanna deal with a JS interpreter or JIT compiler - give me native widgets, please. Qt's new markup language, QML, is a lot higher level than the widgets bindings, but
computationally more expensive. Under the hood, it uses OpenGL and what amounts to a stripped-down web engine - the very thing I was trying to avoid from the get-go.

In keeping with my goal of making the application as lightweight as possible, I opted to use
widgets, but designing my components to be QML-compatible as well. This is accomplished with macros in header files
for Qt types.

I like the ideas of Qt. It's a very easy-to-grasp parallel GUI framework that lets
the developer do pretty much anything they want to...

...except capture AV.

In Qt6, they have done no favors in making it easy to access the underlying frames of a camera or the PCM audio. They have this
brand new thing `QMediaCaptureSession`, and they *really* want you to use their `QMediaRecorder` class to record
videos and stuff. The problem is that there's almost **zero** extensibility in the `QMediaRecorder` class. There's no
way for the developer to implement their own. I had middling success implementing a `QVideoSink` and `QAudioSink` to catch the recording output, but I think I'd just use `ffmpeg` instead.

## Takeaways

I didn't really do much! I just kinda explored a bunch of different technologies and tried - to varying levels of success - to use them all together. GUI is hard; capturing A/V from C++ is hard; emerging protocols are still getting their footing.

Writing projects that bridge languages isn't too hard as long as you have a lingua franca for them to speak over the network or interprocess. There's a great read about that somewhere[^5]. In my case, I used protobufs on QUIC, and it worked pretty well. For future projects, I would likely avoid QUIC as the libraries aren't high-level enough yet that they're ergonomic to use.

There's also the issue of deployment. Protobufs were difficult to deploy on machines that run Windows, as static linkage issues were pretty common. On OSX/UNIX-like, it was a breeze.

I like the ideas in Qt - conceptually they are powerful - however the lack of extensibility for the `QMediaRecorder` type made native audio and video capture pretty difficult. It wasn't exactly friendly to streaming AV capture. I would rather do the project in something like Python with Qt bindings or maybe something that uses [GStreamer](https://gstreamer.freedesktop.org/), I think. With PyQt, I could do more intricate image processing of live captures with something like pillow. The only concern there is performance and deployment woes.

This project will likely be retired, but in any case, it was a good experience being able to explore new technologies and tying heterogeneous programs together.

[^1]: https://www.networkstraining.com/what-is-quic-protocol/
[^2]: Both of these quotes are from the Qt wiki, actually. https://wiki.qt.io/Threads_Events_QObjects
[^4]: https://github.com/cloudflare/quiche/pull/1085
[^5]: https://gankra.github.io/blah/c-isnt-a-language/
