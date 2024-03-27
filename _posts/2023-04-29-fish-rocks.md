---
title: Fish rocks
slug: fish-rocks
date: 2023-04-29T02:13:00-08:00
toc: false
---

"The command line is a programmer's home", or so they say.[^3] I find much truth in this. In the average work day, I probably spend a solid hour or two in the command line building stuff, troubleshooting stuff, or reorganizing stuff. There's nice clients for Git, but I think that it's easier to work with Git through the command line in most cases. I use my VSCode debugger usually, but when I was a student I loved nothing more than GDB. And for a sysadmin, you are _always_ in the terminal. While I'm not a sysadmin, lately, I've been working more and more with Kubernetes. That means I spend _even more_ time in the terminal.

For a long while, I used Zsh, which I didn't know was short for "Z Shell" until a few years ago. Zsh is good because:

1. It is reverse-compatible with Bash
2. It has good scripting extensions to Bash
3. It has a huge community behind it

Most of the customizations for one's shell come in the form of community extensions like `oh-my-zsh`. These extensions will give you a custom prompt, autocomplete, better history, etc. They all work beautifully, but as you tack on more extensions, the terminal tends to get bogged down. Some of them also require external dependencies, like `fzf`. I remember on my old Arch system I'd tack on tons and tons of little extensions to make it look really pretty, but the prompt would take like 250-500ms to draw.

External dependencies are taken to the extreme when you start looking at projects like [Starship](https://starship.rs/), which is a wonderful piece of software, but solves the shell customization problem by introducing a full program that's called every single time you want to render your prompt instead of just a script. There is a clear advantage, though. If you operate across different shells in your day-to-day, then having the exact same prompt in all of them can be handy. Personally, I think Starship is the only livable way to use stock Bash without having an anxiety attack.

But this is *my* laptop. I don't have to use Bash.

If you're okay with sacrificing POSIX-compatibility, [Fish](https://fishshell.com/) packs more out of the box than most shells provide through their community packages. It has autocomplete that it parses from your manpages, nice syntax highlighting while writing scripts, and a neat system of events and event handlers. And, since it's all built into the shell itself, there's no scripting overhead. As cool as my 2016 Zsh was, I think my Fish shell is 25x faster and generally more ergonomic.

When I was getting started, I never really used Fish functions for more than just a few tweaks to commands that I always use, like swapping out `ls` for `exa`, or setting persistent options in other comamnds. I was already happy with the built-in autocomplete and prompts, and didn't have want for much else. Where things really clicked, though, was when I started using Kubernetes.

If you're unfamiliar with Kubernetes, the driving program behind it all is `kubectl`, which is so obtuse and option-rich that there are projects that programmatically generate hundreds of aliases just for all its features![^kubealias] They are supremely useful.

While they are generated as aliases in other shells, in Fish they are generated as _abbreviations_, which are sort of like aliases with superpowers. When typing out the start of an abbreviation, one can tab-complete to see all the possible paths that could be taken. For example, if I type 'k' and then press tab:

```
➜ leo@mydevice:whoami git:(==main) k6 run --help
k                                                       (Abbreviation: kubectl)
k6                                                               (command link)
ka                                 (Abbreviation: kubectl apply --recursive -f)
kadmin                                                                (command)
kadmin.local                                                          (command)
kak                                            (Abbreviation: kubectl apply -k)
kbxutil                                                          (command link)
kcc                                                                   (command)
kcditto                                                               (command)
kd                                             (Abbreviation: kubectl describe)
kdall                         (Abbreviation: kubectl describe --all-namespaces)
kdcm                                 (Abbreviation: kubectl describe configmap)
kdcmall             (Abbreviation: kubectl describe configmap --all-namespaces)
kdcml                             (Abbreviation: kubectl describe configmap -l)
kdcmn                    (Abbreviation: kubectl describe configmap --namespace)
kdcsetup                                                              (command)
kddep                               (Abbreviation: kubectl describe deployment)
kddepall           (Abbreviation: kubectl describe deployment --all-namespaces)
kddepl                           (Abbreviation: kubectl describe deployment -l)
kddepn                  (Abbreviation: kubectl describe deployment --namespace)
kdestroy                                                              (command)
kdf                             (Abbreviation: kubectl describe --recursive -f)
kding                                  (Abbreviation: kubectl describe ingress)
kdingall              (Abbreviation: kubectl describe ingress --all-namespaces)
…and 1265 more rows
```

How handy! I can see all of the different possible expansions that could be achieved from just the letter `k` without having to keep a printout on my desk.

Another two concepts that pervade most of your regular use are contexts and namespaces. You can think of contexts as a particular set of credentials you're using or a role you're assuming, and you can think of a namespace as a collection of objects. Often times, you'll need to switch between contexts and namespaces on the fly. Say, switching between your production and staging environments. This happens so often that there are two community-backed commands - `kubectx` and `kubens` - that handle the switching for you respectively.

Having a ton of aliases for `kubectl` is useful, sure, but what would really save me some keystrokes is if I had my context and namespace information available to me at all times. Enter: events and event handlers.

If we know the path to `kubectx` and `kubens` on our systems (i.e., `which kubectx`), we can wrap them with a function that does a little something extra. For example, we can make it emit an event that the function was run:

```fish
function kubectx
  /path/to/kubectx $argv
  emit kube_change
end
```

...and have that event _handled_ by another function to update a file:

```fish
function handle_kube_change --on-event kube_change
  echo (kubectx -c) > $HOME/.kube_currentctx
end
```

This happens asynchronously in the current terminal process, meaning that we can put the contents of the file into our prompt without fear of a strange halt every time after we run a command while we wait for the next prompt to get populated:

```
echo -ns "Current context: (cat $HOME/.kube_currentctx)"
echo -ns "Current namespace: (cat $HOME/.kube_currentns)"
```

But that lack of POSIX-compatibility is a real zinger. Most people lean on it quite a bit. From regular use, I've only really had issue with it in two common cases:

1. Wildcard expansion
2. Version managers

The rest of the cases I've seen are solved by just keeping `bash` installed on my system. Unless the script needs to export variables, I'm usually pretty set.

These two cases are pretty easy to dodge, though. For wildcard expansion, you just have to remember that if you want to literally pass a `*`, the argument should be quoted somehow. And for version managers, you really don't need a POSIX-compliant one. `nvm` and `gvm` are great, sure, but I have been using [`asdf`](https://asdf-vm.com/) without any issue. Environment files can be kind of annoying since the syntax is varied, but there are some one-liners you can use to dodge problems there, too.[^2] Keeping things home-grown and in my pocket has afforded me a life free of [`bass`](https://github.com/edc/bass).

POSIX-irreverant shells are on the up-and-up. [PowerShell](https://github.com/PowerShell/PowerShell) sees use in build systems and powerful scripts, [Nushell](https://www.nushell.sh/) provides a fancy new way of working with tabular data in the shell, and [Oil](http://www.oilshell.org/blog/2020/01/simplest-explanation.html) seems to be bridging the gap.

Anyways, Bash and Zsh will always have a special place in my heart and their hands in a strangle hold around my neck, but Fish is pretty cool.

[^kubealias]: <https://github.com/ahmetb/kubectl-aliases>
[^2]: I've used this function to much success with a little tweaking: https://gist.github.com/nikoheikkila/dd4357a178c8679411566ba2ca280fcc
[^3]: No one says this.