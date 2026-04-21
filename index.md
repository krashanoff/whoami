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

I love computers.

If you'd like to get in touch, you may email me at [`hello@krashanoff.com`](mailto:hello@krashanoff.com).

<ul class="no-list">
  {% assign postsSorted = site.posts | sort: "date" | reverse %}
  {% for post in postsSorted %}
  <li><a class="{{ post.title_variant }}" href="{{ post.url }}">{{ post.title }}</a> <span class="post-date">({{ post.date | date: "%B %d, %Y" }})</span></li>
  {% endfor %}
</ul>

The only image on this page is a screenshot from episode 3 of 
[Serial Experiments Lain](https://en.wikipedia.org/wiki/Serial_Experiments_Lain).
