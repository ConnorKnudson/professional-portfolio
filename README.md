# Professional Portfolio

Static portfolio website ready to host on any static web server.

## Preview locally

From the workspace root:

```bash
py -m http.server 8000 -d outputs/professional-portfolio
```

Then open:

```text
http://localhost:8000
```

## Public hosting options

- Netlify: drag this `professional-portfolio` folder into Netlify Drop.
- Vercel: create a new project and set the project root to this folder.
- GitHub Pages: push this folder to a GitHub repository and enable Pages from the repository settings.
- VPS/shared server: upload `index.html`, `styles.css`, and `script.js` to the web root, often named `public_html`, `www`, or `/var/www/html`.

## Files to customize

- `index.html`: name, bio, projects, experience, links, and contact email.
- `styles.css`: colors, layout, spacing, and responsive design.
- `script.js`: mobile navigation and automatic copyright year.
