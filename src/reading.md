---
title: Reading
layout: layouts/page.njk
permalink: /reading/index.html
last_updated: 2023-03-15T21:10:00-08:00
---

# Reading

<ul>
  {%- for doc in collections.reading -%}
  <li>
    <a href="{{ doc.url | url }}">{{ doc.fileSlug }}</a>
    </small>
  </li>
  {%- endfor -%}
</ul>
