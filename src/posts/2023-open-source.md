---
title: Release Your "Open" "Source"
date: 2023-06-19T21:19:00-08:00
tags:
  - rant
toc: false
---

I've seen a few repos lately on GitHub that function as no more than an advertisement for a closed-source project that's still in heavy development. What's up with that?

I was originally writing a post talking about this one project, [Warp](https://www.warp.dev/), which is supposed to be a terminal editor. It was one of those "solution looking for a problem" situations. It was just another terminal emulator, but with Internet connectivity, telemetry, and AI for some reason. They tried to justify it with this other bit where you could track shell commands and output as blocks, but they didn't integrate the terminal tightly enough with the shell to capture output perfectly. This system design-level problem kept biting them in the ass, and they had to shell out to a wrapper they placed around Bash to make sure their tracking worked through SSH.[^1]

Ignoring this, it's a good idea on paper. I wouldn't be talking about it so vehemently if the project didn't *release an empty GitHub repository with some vague promises of open-sourcing parts of the app later.* Oh, but don't worry! We have a discussion thread in the empty repo where we will openly posit about the best way of making money.[^2]

There's another project that went and did the same thing recently: a programming language, [Mojo](https://www.modular.com/mojo). They're looking to provide a new programming language for bridging low-level performance and Python's ubiquity in data science. Oh, and it's again supposedly faster than C.[^4]

Again - pretty good idea on paper - but please... Just open source the project or release a beta product, don't give me this "empty repo" business just so people can use incomplete closed-source software, and publicize [all](https://github.com/modularml/mojo/issues/27) [the](https://github.com/modularml/mojo/issues/232) [bug](https://github.com/modularml/mojo/issues/12) [reports](https://github.com/modularml/mojo/issues/15).

I think part of it is also a popularity contest. I feel like ragging on ["The V Incident"](https://xeiaso.net/blog/series/v) today is just beating a dead horse, but it does have some merit as a case study in how unfinished novel ideas will try to draw attention to drive their project across the finish line.[^v]

I look at these projects, then I look at something like Aseprite, or Bitwarden. Aseprite did it right, in that their source is open, but end-users can purchase a pre-built copy. For Bitwarden, they paywall some extra features. This model doesn't really work for developer tooling and programming languages, since your target market is able to build it from source.

I am skeptical that people will genuinely pay per-head-per-month licensing fees for something as fundamental and system-critical as a terminal emulator (with telemetry) or a programming language's engine, though.[^5] It seems too great an organizational risk -- what if the startup with the keys to the castle goes bust? Then again, MATLAB exists. Anyways, please stop this trend of publishing an empty GitHub repo as an advertisement for an unfinished product.

[^1]: <https://docs.warp.dev/help/known-issues#ssh>
[^2]: <https://github.com/warpdotdev/Warp/discussions/400>
[^4]: This one really gets me fired up. Every new programming language I see is faster than C because "we use LLVM and this particular test case worked really well". It's practically a free claim. In any case, the claim is on their docs landing: <https://docs.modular.com/mojo/>
[^5]: Eh, maybe I'm wrong though. <https://github.com/warpdotdev/Warp/discussions/400#discussioncomment-1938429>
[^v]: There is actual work being done on the project, and it ended up growing a little bit more into its claims.
