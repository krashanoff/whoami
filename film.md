---
layout: default
permalink: /film
---

# film

Posts are image-rich and unoptimized.

{% assign postsSorted = site.film | sort: "date" | reverse %}

<ul class="no-list list-spaced">
  {% for post in postsSorted %}
  <li><a href="{{ post.url }}">{{ post.title }}</a> <span class="post-date">({{ post.date | date: "%B %d, %Y" }})</span></li>
  {% endfor %}
</ul>
