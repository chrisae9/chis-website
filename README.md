# chis.dev

Personal blog built with Next.js 16, Tailwind CSS 4, and markdown.

## Running

```bash
docker compose up -d
```

Builds inside the container and serves via Next.js standalone output on port 3000.

## Adding posts

Drop a `.md` file in `content/posts/` with frontmatter:

```yaml
---
title: Post Title
date: 2026-01-01
summary: A brief summary
tags: [Tag1, Tag2]
category: Category
---
```
