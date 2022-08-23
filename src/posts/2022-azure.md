---
title: Run-time dynamic linking in Azure Functions
date: 2022-07-18T21:48:00-08:00
updated: 2022-08-23T21:48:00-08:00
tags:
  - software
  - reverse_engineering
---

Linking C++ code to C# code is easily accomplished with a `[DllImport]`. Deploying it on an Azure Function is another beast. Through exhaustive trial-and-error, it can be determined the Azure Function VM doesn't permit run-time dynamic linking, but *does* permit execution of pre-compiled binaries. To work around this problem, engineers can incorporate the shared C++ code as a separate executable that is shelled out to. There are build issues introduced in this approach that are unaddressed in this article, but may be addressed in a later entry.

***

If you read over the Microsoft article ["Bring dependencies or third party library to Azure Functions"](https://docs.microsoft.com/en-us/azure/azure-functions/bring-dependency-to-functions?pivots=programming-language-python), you might be led to believe that you can bundle dynamic libraries like Opus or maybe even libav into an [Azure Function app](https://docs.microsoft.com/en-us/azure/azure-functions/functions-overview) and load them at run-time.

I investigated this when attempting to integrate some C# code with a C++ library. There's no concrete example for including any shared code in a C# function application in this documentation page (likely because all C# code is a DLL at the end of the day anyway). In theory, it should be as easy as including the library code and associated bindings in the uploaded bundle.

## Background

Let's write a very simple shared library to bundle into a C# application.

```cpp
#include <string>
using std::string;

extern "C" {
bool test(const char *i) {
    string a(i);
    return a.size() == 0 || a.back() == 'a';
}
}
```

Here, we have a simple C++ FFI library that could be compiled to a shared object with `g++ -shared -o libtest.so test.cpp`. The typical way of including this functionality in a C# program would be to use C#'s [`DllImport`](https://docs.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.dllimportattribute?view=net-6.0) attribute. Here's an example class binding to the function.

```cs
using System;
using System.Runtime.InteropServices;

public class TestLib {
    [DllImport("libtest.so")]
    public unsafe static bool test(IntPtr i);
}
```

In production, some additional considerations are warranted:
* Set the `EntryPoint` property of the `DllImport` attribute.
* We could be using a `string` instead of an `IntPtr` since their representation is - in practical application - the same.
* Wrap the `unsafe` functionality in a safe, C#-native function call.

To integrate this into a published package, we could copy the library to the publish directory with an additional `ItemGroup` in the `.csproj` file for our application or library:

```xml
<ItemGroup>
    <None Update="libtest.so" CopyToOutputDirectory="Always" />
</ItemGroup>
```

This is easily incorporated into a Azure class library function by adding a reference in its `.csproj`. Running the resulting function app locally with `func start` works without issue. I tested this on both my WSL subsystem and my Windows native system.

## Deploying to Azure + Debugging

After deploying a function that utilizes our shared library, though, any request against it will return a 501.

The Azure Function app runtime is a bit of a black box. There isn't much documentation about what file system operations are permitted, what container capabilities are missing or forbidden, or exactly how it launches your code.

With some early function returns and a lot of patience, I confirmed that the function runs fine until the library tries to load. With additional response-based testing on a live runtime, I was able to determine that:
* The shared library still exists on the runtime's disk.
* The library can have its permissions changed, even through calls to `chmod`.
* Any attempt to call code using it will immediately halt the function, returning a 501. Any code running before the call works fine. That is, the library is dynamically linked at run-time.

Hang on... The library can be `chmod`'d... How did I `chmod` the library in my code? **I shelled out.**

Following this train of thought, I tried spawning an instance of `echo` in a function app on the Linux runtime and sending an HTTP response with its output, and it operated as expected. So if shelling out works, then the "dependencies" part of the documentation was right, but I can't seem to get the "library" part to work! Was I led astray?

Maybe, but it's more likely that I made an incorrect inference. The documentation never once mentioned anything about libraries save for the introduction. The only examples given used a statically-linked `ffmpeg`. They may have aluded to being able to include shared libraries, but they never explicitly stated it. They *especially* didn't state it in C# - there wasn't even an example.

## The Solution

Instead of providing C# bindings to the C++ library, I made the library's functionality accessible through a statically-linked CLI application. This was then exposed to the main application using a C# wrapper around [`System.Diagnostics.Process`](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.process?view=net-6.0).

Lo and behold, it worked without a hitch. The hard part was combining the C++ and C# build systems into a coherent, one-line command. I may write about this more at a later date, but I did so with PowerShell.

## Takeaways

The Azure Function app runtime cannot load non-C# shared libraries, but it *can* shell out to statically-linked executables. This holds despite Azure's documentation and local development tools suggesting otherwise. If you absolutely need to integrate shared code to an Azure Function app, make a simple CLI for the subset of functionality your app requires.

Load-time dynamic linking is likely disabled for security reasons. Maybe it's on me for failing to research enough, but I couldn't find any other documentation on how the Azure runtime handles shared libraries for the life of me, and ended up sinking way too much time into debugging. Hopefully this knowledge will help others.

## Other Reading

* https://mark-borg.github.io/blog/2017/interop/
* https://docs.microsoft.com/en-us/cpp/dotnet/dotnet-programming-with-cpp-cli-visual-cpp

