---
title: NIST in a Nutshell
layout: layouts/page.njk
permalink: /cyber/index.html
---

# Special Series: NIST in a Nutshell

Howdy! You can imagine my surprise as a fresh grad when I discovered that computer security in industry (mostly) wasn't hacking or malware at all. When you get down to it, it's just really good documentation and the people who read and write it.

The big one in the states for information protection is the **Federal Information Processing Standard (FIPS)**. The 140-X (where X is some number) family of documents set the ~~terribly long-winded~~ necessarily specific bar on cryptography standards for the US and Canadian governments. FIPS, though, is really just a body of lengthier documents published by the **National Institute of Standards and Technology (NIST)**.

I'm hardly an expert -- the amount of documentation and person-hours that go into this is insane -- but I love to learn about it and I have the good fortune of working with it pretty often in my job. So, to help you *and me* both get more familiar with these documents, I'm going to write some abridged sources for quick reference.

If you are interested in a very brief overview of the documents and their purpose, please refer to the [appendix](#appendix) of this document.

It should go without saying that **these are not intended to replace or represent the original NIST publications in any way.** Please always refer to the original documents, and if there's an error in *any* of the information that I've made available on my website, **please email me immediately at `hello@krashanoff.com`!**

Now, without further ado...

## NIST in a Nutshell

The way that I would (and am, as I write it) approach these documents is by first ensuring sufficient knowledge of the provided NIST 800 documents (not the 140 series). This will guarantee that you're familiar with the jargon.

### NIST 800

<ul>
  {%- for doc in collections.nist -%}
  <li>
    <a href="{{ doc.url | url }}">{{ doc.data.title }}</a>
    <small>Last updated <time>{{ doc.data.date | datePlain }}</time></small>
  </li>
  {%- endfor -%}
</ul>

### FIPS 140

<ul>
  {%- for doc in collections.fips -%}
  <li>
    <a href="{{ doc.url | url }}">{{ doc.data.title }}</a>
    <small>Last updated <time>{{ doc.data.date | datePlain }}</time></small>
  </li>
  {%- endfor -%}
</ul>

### Related Writings

<ul>
  {%- for doc in collections.etc -%}
  <li>
    <a href="{{ doc.url | url }}">{{ doc.data.title }}</a>
    <small>Last updated <time>{{ doc.data.date | datePlain }}</time></small>
  </li>
  {%- endfor -%}
</ul>

## Appendix

### NIST 800 Document Overview

All documents are in NIST's 800 series of publications.

Doc | Purpose and synopsis
-|:-
38A | Legacy special publication describing cryptographic modes of operation. ECB, CBC, CF, OF, and counter modes. Also contains some recommendations for padding data.
38G | Rather than 38a’s five modes of operation, describes two. FF1 and FF3. Both modes are general-purpose, and utilize a common block cipher.
56A | Key-agreement. Essentially, DH or Noise-like protocols.
56B | Key-establishment. This is a high-level description of Diffie-Hellman with trusted third-party (TTP) assurance. Assurance requirements are described in section 6 of this document.
56C | Key-derivation. Describes how a valid key-derivation function is implemented.
57 | Key management. How to store and handle short-term, long-term, permanent, or ephemeral cryptographic keys. Also covers some information on how to handle RBG seeds, passwords, etc.
90A | Random bit generator proper use and entropy management.
90B | Entropy source health tests and validation.
131A | Transitioning the government to use elliptic curve cryptography as standard.
132 | How to derive keying material from a password using a Password-Based Key Derivation Function (PBKDF), taking the password, length of the key, and a salt as input.
133 | Description of how key pairs should be generated. There are many ways to generate symmetric keys, but only a few to generate asymmetric ones.
