---
title: "Exploring OpenBSD"
date: 2021-09-24T00:00:00-07:00
---

I'm an operating systems enthusiast, and love [Linux](https://www.linux.org/).

This said, there's plenty of other operating systems out there to explore, and
a significant fraction of those alternatives are labelled "BSD", referring to
the [Berkeley Software Distribution](https://en.wikipedia.org/wiki/Berkeley_Software_Distribution)
derivatives of the [Unix](https://en.wikipedia.org/wiki/Unix) operating system that
emerged shortly after [Bell Labs](https://en.wikipedia.org/wiki/Bell_Labs) dissolved.

What's nice about BSD Unix is that most of them try to stay relatively
true to the original Unix philosophy, and remain as free as they possibly
can without sacrificing quality. Why not start, then, by dipping our toes into the
water with the OS that claims to be ["all free"](https://www.openbsd.org/faq/faq1.html)?

## OpenBSD

...or maybe it was a leap.

I set out on my OpenBSD expedition to build a router for my roommate and I while
we were waiting on another, who had a router/wireless AP. Faced with a cable
modem from our local ISP, we had no choice but to pursue making a router of our
internet-facing machine.

I browsed on over to the [OpenBSD website](https://www.openbsd.org/), likely
bouncing off a few `(Free|Open)`BSD servers before hitting the OpenBSD box
hosting the site.

On the Internet, these BSD-derivatives are ubiquitous for critical systems. At least
in the case of OpenBSD, this is for good reason: the
operating system [relinks the kernel on boot](https://www.openbsd.org/faq/upgrade63.html),
introduced [W^X](https://en.wikipedia.org/wiki/W%5EX), and opportunistically integrates cryptography
throughout. The team isn't afraid to tote this around -- they even have a page
basically [flipping off a few governments](https://www.openbsd.org/crypto.html).

## UX

Post-download, I imaged a flash drive, spun up the years-old hardware destined
to become our temporary router, and dove right in.

The OpenBSD experience is classic. It's still using [`ffs(7)`](https://www.freebsd.org/cgi/man.cgi?query=ffs&sektion=7), has an
exceedingly stable kernel with a [sizable lock](https://en.wikipedia.org/wiki/Giant_lock),
and isn't very quick to adopt
the latest technologies (Intel's [AES-NI](https://www.intel.com/content/www/us/en/architecture-and-technology/advanced-encryption-standard-aes/data-protection-aes-general-technology.html) comes to mind). If you do happen
to have a few terabytes onboard your OpenBSD computer, it might take a couple
hours to run [`fsck(8)`](https://man.openbsd.org/fsck) if shit hits the fan.

These aren't necessarily bad things. My little server
does not need more than a few gigabytes of storage and two cores for what it's
doing, and all I really demand of an operating system for its purposes is stability.

Luckily, the setup process is far from classic. The install is very, very
smooth. Compared to something like [Gentoo](https://wiki.gentoo.org/), it's a breeze with just a few
prompts mirroring what you'd see in your average Debian installation wizard.

Once inside, OpenBSD is a well-documented, well-polished system with very few "huh?"
situations. By that, I mean situations where I found myself face-to-face with a
bug the manpages didn't give me explicit instruction against -- it does a great
job of easing the user into the operating system so that info dumps are more
sparse, and the learning curve is gradual.

You will learn to use [`man(1)`](https://man.openbsd.org/man.1).
You will learn what your [`/etc`](https://man.openbsd.org/hier) directory is for.
These are all good things.

I set up a router, firewall, and FTP server for our apartment with ease, and
was even comfortable enough to set up a few network tunnels (see: [`tun(4)`](https://man.openbsd.org/tun.4))
for certain applications.

The only "mystery bug" that I encountered was that every now and again, our packet
filter would drop a few packets for maybe a half-second, even using the default
configuration. Time to resolve this problem: we put down our manpages. We turn
to Google.

## Community

Googling around for a fix for that little half-second packet drop issue took
me almost two days of inconclusive results, but I was *not* about to hop on
the mailing lists or forums and ask a question so broad.

The community for OpenBSD is [dwarfed](https://distrowatch.com/table.php?distribution=freebsd) compared to [FreeBSD](https://www.freebsd.org/) or any Linux flavor.
I'd compare it in size to something like [BunsenLabs Linux](https://www.bunsenlabs.org/).
Unlike BunsenLabs, though, OpenBSD's community has a reputation of being *exceedingly* unyielding. A
large part of this could be attributed to the personality of its
leader, who, by Linus' account, is ["difficult"](https://www.forbes.com/2005/06/16/linux-bsd-unix-cz_dl_0616theo.html).

This is the argument that most people will give you, but, in my opinion,
there's a much easier, less personal take.

One of the downsides of having extensive documentation is that developers
and users may grow frustrated reading questions answered in the docs
they just updated over and over again. For the new user, unfamiliar with
mailing lists, past answers may not be as readily available. Mix these two
together and you have a situation akin to the Linux mailing lists, but with
less margin for discussion.

## Freedom and Software

If I had to pick a straw that might break the camel's back for an OpenBSD
novice like me, it's probably OpenBSD's lack of software.

I was trying to port my little file sharing server to the operating system
earlier today. The problem is that it's written in Rust. I definitely
could have written the program in another language like C or Go or something,
but I felt like writing it in Rust.

Unfortunately, [`rustup`](https://rustup.rs/) isn't available on [OpenBSD ports](https://openports.se/),
and OpenBSD itself is a [tier 3 platform](https://doc.rust-lang.org/nightly/rustc/platform-support.html#tier-3)
for Rust compilation. This means that compiling Rust natively is painful, and
cross-compiling Rust is next to impossible.

This is when the cracks in the facade start to show for OpenBSD. Compared
to FreeBSD, which has a huge number of packages available for download and
[binary compatibility with Linux](https://docs.freebsd.org/en/books/handbook/linuxemu/),
OpenBSD keeps their software repositories pretty tight
to maintain their openness and keep their interoperability with older systems.
They also discourage use of proprietary drivers.

That is, OpenBSD seems to place its focus in expanding the freedom of software,
sometimes at expense of the user's freedom of choice.

## Purpose Built; Proper Abstractions

OpenBSD is an operating system that is built to run on hardware,
[not virtualized](https://www.virtualbox.org/ticket/639).
It is built for security, software freedom, and stability. It is
easy to understand and secure by default. The issues I encountered in my experience
with it were pretty tame compared to those I ran into on any Linux derivative.

Thinking back to something as elementary as rebooting my computer after my first
Linux installation, I remember [getting softlocked at shutdown](https://unix.stackexchange.com/q/249654).

Reflecting on more recent experiences with Manjaro, I recall my configuration files
for system-critical processes being scattered everywhere, and having too much power
granted to me with too little knowledge. Garbage was left behind by packages without
my knowledge, and without any clear way to locate it all.

A lot of these issues can be chalked up to Linux distributions getting filled with bloatware
and one-off abstractions that fail to empower their users in efforts of being
"the best OS". Consider Ubuntu's redundancies: [`iptables(8)`](https://manpages.ubuntu.com/manpages/precise/en/man8/iptables.8.html), [`ufw(8)`](https://manpages.ubuntu.com/manpages/bionic/man8/ufw.8.html), [`apt(8)`](https://manpages.ubuntu.com/manpages/xenial/man8/apt.8.html), [`snap(8)`](https://manpages.ubuntu.com/manpages/impish/en/man8/snap.8.html). Consider Gentoo's behemoth [`portage(5)`](https://wiki.gentoo.org/wiki/Portage).

OpenBSD's objectives, on the other hand, are precise, and it is a damn good
solution to them.

> So does all of this mean that BSD is superior to Linux?

eh.
