---
title: "Virtualizing a Minecraft Server on OpenBSD"
date: 2022-01-29T05:02:00-08:00
draft: false
layout: layouts/post.njk
---

*"Thinking quickly, Dave constructs a homemade megaphone using only some string, a squirrel,
and a megaphone."*[^1]

Minecraft recently got its bump to version 1.18.1, and my girlfriend and I have been looking
for a way to play without running the server locally on my machine. I have an OpenBSD box (see
[my previous post]({{ './2021-exploring-bsd' | url }})) that I have been using for my remote
needs, so I figured I could run the server on it fairly easily.

## The Hardware

First, let's meet the lambo I plan to have running this:

```
# top

...
CPU0 states:  ...
CPU1 states:  ...
Memory: Real: 82M/1782M act/tot Free: 6024M Cache: 1084M Swap: 0K/2818M
...

# df -h
Filesystem     Size    Used   Avail Capacity  Mounted on
/dev/ab0x      986M    107M    830M    11%    /
...
/dev/ab0y      9.4G    936M    8.1G    10%    /home
```

Oh hell yes. Two cores. Like 8G of RAM. *Maybe* 8G of disk space. We're gonna make this
thing work like Atlas.

## The Software

To get a Minecraft server running, all you need is the latest version of the JRE. For most
machines, this really isn't a problem. Java *does* run on 3 billion devices[^2], after
all. How bad could it be? Let's go ahead and check [ports](http://ports.su/devel/jdk):

![jdk 1.8 in openbsd ports]({{ '/static/img/mcbsd/jdkports.png' | url }})

3 billion, it would seem, does not include OpenBSD. Well, not the latest version of Java, at least.
OpenBSD doesn't really have much in the way of modern luxury when it comes to Java. This is
in line with their philosophy, I mean think about how many damn licenses are sitting on a JRE.

This said, I am not so headstrong as to port my own OpenJDK, not so eager to find a way to
use [OpenPorts](https://openports.se/devel/jdk/17), and not so foolish as to use some weird hacky
stuff for running a `jar`, so what's the solution here?

**Isn't it so obvious? Just virtualize a Linux box!**

## Enter: `vmm(4)`

I decided to virtualize a lightweight Linux distribution inside of my OpenBSD box to run the latest
server, then NAT Minecraft clients to it.

It's easier to virtualize hardware on OpenBSD than you might think. [`vmm(4)`](https://man.openbsd.org/vmm.4)
provides capability in spades. All we need to do to enable it is add a line to our
[`rc.conf.local(8)`](https://man.openbsd.org/rc.conf).

```sh
echo "vmd_flags=" >> /etc/rc.conf.local
```

Let's go ahead and create our working directory and its virtual disk with [`vmctl(8)`](https://man.openbsd.org/vmctl.8).

```
# useradd -m -s /sbin/nologin /home/minecraft
# cd /home/minecraft
# vmctl create -s 5G minecraft.qcow2
vmctl: qcow2 imagefile created
```

All we have to do now is just pick a Linux distribution to run on our (admittedly sparing) disk
space. All I really need is [Alpine](https://www.alpinelinux.org/), since it supports the latest
JDK and keeps things tidy. After fetching the boot disk, the startup command isn't so bad:

```
# vmctl start -m 2G -L -i 1 -r alpine-virt-x86_64.iso \
  -d minecraft.qcow2 minecraft
vmctl: started vm 1 successfully, tty /dev/ttyp1
```

* `-m 2G`: 2G of memory.
* `-L`: link over network. Basically spin up a subnet for the VM.
* `-i 1`: one network interface.
* `-r`: boot from an image.

All set.

```
# vmctl show
   ID   PID VCPUS  MAXMEM  CURMEM     TTY        OWNER    STATE NAME
    1 24772     1    2.0G   96.4M   ttyp1         root  running minecraft
```

I won't lie, a 5G disk might be a bit pessimistic for how small we can get this thing, and 2G of memory
might be pushing it for a machine that's rocking the base amount that you'd expect out of a nicer
Chromebook[^3]. We'll limit test later, though. Right now, there are more important matters to tend
to.

## NAT

Before we can use our machine to reach the internet, we've got to redirect traffic to it.
Time for [`pf(4)`](https://man.openbsd.org/pf) to go to work. We add a rule to redirect traffic in
on port 25565, and allow outbound traffic.

I don't run my server as a DNS cache, so the third rule (pulled from [xhr's post](https://xosc.org/vmm.html))
maps DNS to [Cloudflare](https://1.1.1.1/).

```
match out on egress from $minecraft to any \
    nat-to egress
pass out on egress from $minecraft to any \
    nat-to egress
pass in proto udp from $minecraft to any port \
    domain rdr-to 1.1.1.1 port domain

pass in on egress proto tcp from any to (egress) \
    port { 25565 } rdr-to $minecraft
pass in on egress proto udp from any to (egress) \
    port { 25565 } rdr-to $minecraft
```

Before putting these rules into action, make sure that we have IP forwarding enabled in
[`sysctl(5)`](https://man.openbsd.org/sysctl.conf.5):

```
# sysctl net.inet.ip.forwarding
net.inet.ip.forwarding=1
```

Networking is ready for our VM. Let's get to work.

## `setup-alpine`

Time to get our virtual machine set up. We can hop into the VM's console, login as `root`, and
run [`setup-alpine`](https://wiki.alpinelinux.org/wiki/Installation) as usual.

```
# vmctl console minecraft
Connected to /dev/ttyp1 (speed 115200)
```

Alpine's install is streamlined like OpenBSD's. Just page through with sane defaults and we're
set. Surprisingly, the arduous portion of this operation was just waiting for it to ping mirrors,
start chrony, all that good stuff.

After that's all set, we have to install dependencies. The only dependency we really need to run
our Minecraft server is [openjdk17](https://pkgs.alpinelinux.org/package/edge/community/aarch64/openjdk17).

Since this is available in community, we install it by specifying the repository:

```sh
apk add openjdk17 --repository=https://pkgs.alpinelinux.org/package/edge/community/aarch64/openjdk17
```

Once that's done, we can check our version of the JRE.

```
# java --version
openjdk 17.0.2 2022-01-18
OpenJDK Runtime Environment (build 17.0.2+8-alpine-r0)
OpenJDK 64-Bit Server VM (build 17.0.2+8-alpine-r0, mixed mode, sharing)
```

Looking good. After downloading the latest Minecraft server `jar` and prepping our server directory,
we just add the driver script for our preferred `java` command as a start script in `/etc/local.d/`.

## On-Boot

If we want to let this run automatically, we're going to have to set up our VM to start on boot. This
is accomplished through [`vm.cfg(5)`](https://man.openbsd.org/vm.conf).

```
vm "minecraft" {
    memory 2G
    enable
    disk /home/minecraft/minecraft.qcow2
    local interface
    owner minecraft
}
```

Now when we reboot, the machine will run at boot and run under the `minecraft` user.

## Limit Testing

Surprisingly, the entire Alpine + JDK install only comes out to about 345MiB. The size of the minecraft
server installation on my Windows disk is about 391MB. So what we *really* require in disk space is about
3G. If we really wanted to push it, we could go to about 2G.

The amount of RAM the VM sips at idle is about ~300MB, so we could shove its RAM consumption down to
about 1.5G.

```
athome# vmctl show minecraft
   ID   PID VCPUS  MAXMEM  CURMEM     TTY        OWNER    STATE NAME
    1 28555     1    1.5G    1.5G   ttyp1         root  running minecraft
```

...okay maybe we can't. I went ahead and upped the memory to around 3G and that seemed to do the trick
for the stock server command that grants the `jar` about 1G of RAM.

## Performance

And so comes the question: is it fast? Well, not really.

I tested it out and saw a pretty *okay* TPS, but it's clear that a Minecraft server wasn't meant to be
run on a virtual machine with meager resources allocated to it on an already-resource-limited host.
Notably, the whole server would eat dirt when transitioning between the Overworld and the Nether.

Once chunks were loaded, performance wasn't an issue on the local network. Player activity was fairly
snappy. This said, the chunk load time being painful made me uncomfortable taking this Frankenstein
out of the lab. I just stuck with my own machine.

## Conclusions and Future Considerations

Running a Minecraft server on a virtualized Alpine machine isn't a bad idea if you have the hardware
for it. I do not.

In the future, I'd like to upgrade my server hardware and try this again, experimenting with ways of
storing the Minecraft world folder in a host-system accessible folder. On any other virtualization
solution, this wouldn't be too hard, but OpenBSD's virtualization daemon doesn't support hardware
passthrough yet[^4].

Network passthrough is a breeze with [`pf(4)`](https://man.openbsd.org/pf), but the only viable option
for file-sharing between the two is through a network share like [`smbd(8)`](https://linux.die.net/man/8/smbd).
That would kill performance.

I think that if I were to get this set up, I'd just have a cronjob on the VM that periodically backs
up the Minecraft world at regular intervals over SSH to an S3 bucket with [`rclone(1)`](https://rclone.org/).

```sh
#!/bin/sh
NAME="backup-$(date +%D).tar.gz"
tar -czf $NAME /root/server
rclone copy $NAME s3:/minecraftWorlds/
```

Anyways, this was a fun little project and an educative experience. I may return to it to see if I
can improve performance on the little server that could&trade;.

[^1]: https://www.youtube.com/watch?v=d59J78yhwtg
[^2]: https://skeptics.stackexchange.com/a/9873
[^3]: You'd expect to see around 8GB in newer models. https://zipso.net/chromebook-specs-comparison-table/
[^4]: https://www.reddit.com/r/openbsd/comments/ih4vns/pci_passthrough_on_vmm/