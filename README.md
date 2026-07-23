# Marceline Yu

This repository contains the source code for my personal portfolio: **[marcelineyu.github.io](https://marcelineyu.github.io/)**

I built this site to bring together work that does not fit neatly into a single category. It reflects my interests across product, technology, strategy, global business, and cross-cultural research, while also leaving space for the personal experiences that have shaped how I think and work.

## About the site

The portfolio is organized as a single-page experience with six main sections:

- **About Me** — background, education, languages, and technical skills
- **Selected Experience** — roles across technology, marketing, consulting, and operations
- **Things I Build** — independent projects, including a supply chain crisis simulator, AI Reel Maker, Artly, and my photography archive
- **Research & Projects** — academic, consulting, and field research presented through expandable case studies
- **Beyond Work** — personal interests, volunteer work, travel, and an interactive 3D globe
- **Stay Connected** — contact and resume request forms

## Design and development

The site is built with plain **HTML, CSS, and JavaScript**. I intentionally kept it framework-free, with no build step or package installation required.

A few of the interactive elements include:

- an animated Three.js sky in the hero section
- an interactive 3D travel globe
- scroll-based transitions and section reveals
- project previews, image galleries, and a lightbox
- contact and resume request forms powered by Formspree

The visual direction is clean and editorial, with interactive details that make the site feel more personal without distracting from the content.

## Run locally

Because the site uses ES modules, it should be served over HTTP rather than opened directly as a local file.

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Any other static server will work as well.

## Deployment

The site is published through GitHub Pages from the `main` branch. There is no separate build or deployment workflow; updates go live after changes are pushed to the repository.

## Contact

**Marceline Yu**  
[marceline.yu@yale.edu](mailto:marceline.yu@yale.edu)  
[LinkedIn](https://www.linkedin.com/in/marcelineyu/)

---

Content and photography © Marceline Yu. Code is shared for reference.
