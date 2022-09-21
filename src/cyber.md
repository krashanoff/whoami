---
title: NIST in a Nutshell
layout: layouts/page.njk
permalink: /cyber/index.html

last_updated: 2022-09-18T22:44:00-08:00
---

**Note: this portion of my website is under heavy construction! However, there's still some useful information here about certain aspects of NIST 800-38 and the high-level overview of FIPS 140-3.**

***

# WIP: Notes on Cybersecurity

<small>Last updated: <date>{{ last_updated | datePlain }}</date></small>

Howdy! You can imagine my surprise as a fresh grad when I discovered that computer security in industry -- when you get down to it -- is just documentation and the people who read, write, and implement it.

The big one in the United States for information protection is the **Federal Information Processing Standard (FIPS)**. The 140-X (where X is some number) family of documents set the ~~terribly long-winded~~ necessarily specific bar on cryptography standards for the US and Canadian governments. FIPS, though, is really just a body of lengthier documents published by the **National Institute of Standards and Technology (NIST)** applied as adjustments to an *even lengthier* [ISO specification](https://www.iso.org/standard/52906.html).

I'll likely focus on this standard and explaining it in sensible, cliff notes-style language. I'm hardly an expert -- the amount of documentation and person-hours that go into this is insane -- but I have found that learning about it is actually pretty fun.

If you are interested in a very brief overview of the documents and their purpose, please refer to the [appendix](#appendix) of this document.

## Disclaimer

It should go without saying that **these are not intended to replace or represent the original NIST publications in any way.** Please always refer to the original documents. The use of the name "NIST" in this website is not intended to reflect the opinions or beliefs of the National Institute of Standards and Technology itself in any way, shape, or form. All information assembled in this website pertaining to NIST is collected from the public domain at NIST's website, where all publications are publicly available for download: https://csrc.nist.gov/publications/sp800.

If there is an error in *any* of the information that I've made available on my website, **please email me immediately at `hello@krashanoff.com`!** It is not my intent to spread misinformation.

Now, without further ado...

## Special Publications in a Nutshell

As opposed to the much catchier "NIST in a Nutshell". Out of an abundance of caution for misrepresenting the NIST in any way, I want to make it clear: the actual name of the series is not **"NIST IN A NUTSHELL"**. It is **NOT** "NIST in a Nutshell".

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

## Miscellaneous Writings

{% if collections.etc.length != 0 %}
<ul>
  {%- for doc in collections.etc -%}
  <li>
    <a href="{{ doc.url | url }}">{{ doc.data.title }}</a>
    <small>Last updated <time>{{ doc.data.date | datePlain }}</time></small>
  </li>
  {%- endfor -%}
</ul>
{% else %}
<p>None yet!</p>
{% endif %}

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
