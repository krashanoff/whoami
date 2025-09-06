---
layout: default
---

<figure>
  <picture>
    <source type="image/webp" srcset="{{ "/static/img/pfp/lain.webp" | relative_url }}">
    <img id="coverimage" src="{{ "/static/img/pfp/lain-small.png" | relative_url }}" alt="iwakura lain repairing a bulky computer in her nightgown" />
  </picture>
  <figcaption><i>Everyone is connected...</i></figcaption>
</figure>

## Who are you?

I am a software engineer at [Ramp](https://ramp.com/). Previously, I was a software engineer at
[Regrello](https://www.regrello.com/), and a systems engineer at [Booz Allen Hamilton](https://www.boozallen.com/).
I attended [UCLA](https://www.ucla.edu/) for my bachelor's.

I love computers.

If you'd like to get in touch, you may email me at [`hello@krashanoff.com`](mailto:hello@krashanoff.com).

## Blog Posts

I write from time to time. You may review past posts as linked below.

<ul class="no-list">
  {% assign postsSorted = site.posts | sort: "date" | reverse %}
  {% for post in postsSorted %}
  <li><a class="{{ post.title_variant }}" href="{{ post.url }}">{{ post.title }}</a> <span class="post-date">({{ post.date | date: "%B %d, %Y" }})</span></li>
  {% endfor %}
</ul>

## Can't find what you're searching for?

There used to be an impromptu reading list and some incomplete notes on cybersecurity policy and cryptographic module
validation here (NIST 800-5X; FIPS 140-2 and 140-3). If, by chance, you
are looking for them, you can find the original documents in the Git repository for this website at commit SHA
`e070a1545f43f118750b171e70872756b1c91d2e`. [Link for your convenience](https://github.com/krashanoff/whoami/tree/e070a1545f43f118750b171e70872756b1c91d2e).

## What is the source for this page's image?

The only image on this page is a screenshot from episode 3 of 
[Serial Experiments Lain](https://en.wikipedia.org/wiki/Serial_Experiments_Lain).
