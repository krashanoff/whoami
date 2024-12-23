---
layout: default
permalink: /film
title: film
---

Rather than film reviews, please consider these as loosely-organized thoughts that occurred to me while viewing. I make a best effort to omit spoilers from my posts, and focus more on the artistic aspects of the film. As a result, I tend not to get into the specifics of each film's plot.

Posts are image-rich and unoptimized. If you're on a poor Internet connection, please take heed.

{% assign postsSorted = site.film | sort: "date" | reverse %}

<ul class="no-list list-spaced">
  {% for post in postsSorted %}
  <li><a href="{{ post.url }}">{{ post.title }}</a> <span class="post-date">({{ post.date | date: "%B %d, %Y" }})</span></li>
  {% endfor %}
</ul>
