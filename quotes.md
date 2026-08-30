---
layout: default
permalink: /quotes
title: Quotes
quotes:
  - source: Fred Brooks, The Mythical Man-Month
    quote: |
      An omelette, promised in two minutes, may appear to be progressing nicely. But when it has not set in two minutes, the customer has two choices—wait or eat it raw. Software customers have had the same choices.

      The cook has another choice; he can turn up the heat. The result is often an omelette nothing can save—burned in one part, raw in another.
  - source: Axiom Verge
    quote: |
      Any algorithm giving rise to cognitive entities will be perceived as reality by the entities described.
  - source: Cure (1997)
    quote: |
      俺の中にあまっていたものが、みんな外へ出ちゃったんだ。だから、あんたの中のものがよく見える。
---

This page may be updated without warning. Quotes are presented in no particular order.

<hr>

{% for quote in page.quotes %}
{% capture slug %}
{{ quote.quote | truncate: 15 | slugify }}
{% endcapture %}

<blockquote>
<p>
{{ quote.quote | newline_to_br }}
</p>

<p>
- <em>{{ quote.source }}</em> <a id="{{ slug }}" href="#{{ slug }}">↩</a>
</p>
</blockquote>

{% unless forloop.last %}
<hr>
{% endunless %}
{% endfor %}

