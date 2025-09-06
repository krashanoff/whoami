---
layout: default
title: tags
permalink: /tags/index.html
---

{% assign tagsSorted = site.tags | sort: 'name' %}

<ul>
  {% for tag in tagsSorted %}
  <li><a href="{{ site.baseurl }}/tags/{{ tag.slug }}">{{ tag.slug }}</a>: {{ tag.desc }}</li>
  {% endfor %}
</ul>
