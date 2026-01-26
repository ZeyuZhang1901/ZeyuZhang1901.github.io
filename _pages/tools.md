---
layout: default
permalink: /tools/
title: Tools
nav: true
nav_order: 5
---

<div class="post">
  <div class="header-bar">
    <h1>Tools</h1>
    <h2>Useful tools and utilities I've built for research and development</h2>
  </div>

  <div class="tools-grid">
    {% assign tools = site.tools | sort: "importance" | reverse %}
    {% for tool in tools %}
    <div class="tool-card">
      <a href="{{ tool.url | default: tool.external_url }}" {% if tool.external_url %}target="_blank"{% endif %}>
        <div class="card hoverable">
          <div class="card-body">
            {% if tool.icon %}
            <div class="tool-icon">
              <i class="{{ tool.icon }}"></i>
            </div>
            {% endif %}
            <h3 class="card-title">{{ tool.title }}</h3>
            <p class="card-text">{{ tool.description }}</p>
            {% if tool.tags %}
            <div class="tool-tags">
              {% for tag in tool.tags %}
              <span class="badge">{{ tag }}</span>
              {% endfor %}
            </div>
            {% endif %}
            {% if tool.external_url %}
            <div class="external-link-indicator">
              <i class="fa-solid fa-external-link-alt fa-sm"></i> Open Tool
            </div>
            {% endif %}
          </div>
        </div>
      </a>
    </div>
    {% endfor %}
  </div>
</div>

<style>
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.tool-card .card {
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.tool-card .card:hover {
  transform: translateY(-4px);
}

.tool-card a {
  text-decoration: none;
  color: inherit;
}

.tool-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--global-theme-color);
}

.tool-card .card-title {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.tool-card .card-text {
  color: var(--global-text-color-light);
  font-size: 0.95rem;
  line-height: 1.5;
}

.tool-tags {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tool-tags .badge {
  background-color: var(--global-theme-color);
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.external-link-indicator {
  margin-top: 1rem;
  color: var(--global-theme-color);
  font-size: 0.9rem;
  font-weight: 500;
}
</style>
