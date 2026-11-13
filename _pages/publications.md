---
layout: page
permalink: /publications/
title: Publications
nav: true
nav_order: 2
---

<!-- _pages/publications.md -->

<!-- Bibsearch Feature -->

{% include bib_search.liquid %}

<div class="publications">

<h2 class="bibliography">First-Author Publications</h2>
{% bibliography --group_by none --query @*[category=First Author Publications] %}

<h2 class="bibliography">Preprints</h2>
{% bibliography --group_by none --query @*[category=Preprints] %}

<h2 class="bibliography">Co-authored Publications and Preprints</h2>
{% bibliography --group_by none --query @*[category=Co-authored Publications and Preprints] %}

</div>
