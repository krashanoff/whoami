---
layout: default
---

<figure id="coverfigure">
  <picture>
    <source type="image/webp" srcset="{{ "/static/img/pfp/wired.webp" | relative_url }}">
    <img id="coverimage" src="{{ "/static/img/pfp/wired.png" | relative_url }}" alt="iwakura lain repairing a bulky computer in her nightgown" />
  </picture>
  <figcaption><i>Everyone is connected...</i></figcaption>
</figure>


<ul class="no-list">
  {% assign postsSorted = site.posts | sort: "date" | reverse %}
  {% for post in postsSorted %}
  <li><a class="{{ post.title_variant }}" href="{{ post.url }}">{{ post.title }}</a> <span class="post-date">({{ post.date | date: "%B %d, %Y" }})</span></li>
  {% endfor %}
</ul>

