# abdulqudus-aremu portfolio

Personal site of Abdulqudus Aremu: a front page and six system design docs.
Static site, built with Next.js (App Router, static export). No server and no third-party requests at runtime.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # writes the static site to ./out
```

## Deploy

Every push to `main` is built and published to GitHub Pages by `.github/workflows/deploy.yml`.
The site is served at https://abdulqudus-a.github.io.

`npm run build` produces plain files in `out/`, so any static host works (Cloudflare Pages, Netlify, Vercel).
To move, or to use a custom domain, change `NEXT_PUBLIC_SITE_URL` in the workflow so the sitemap and the
sharing image use the new address:

```bash
NEXT_PUBLIC_SITE_URL=https://example.com npm run build
```

## Where things live

| What | Where |
| --- | --- |
| All front-page copy, the list of design docs, links | `src/content/site.ts` |
| A design doc page | `src/app/systems/<slug>/page.tsx` |
| A doc's diagram and its step-through | `src/content/diagrams/<name>.ts` |
| Diagram and walkthrough components | `src/components/diagrams/`, `src/components/Walkthrough.tsx` |
| Styles and design tokens | `src/app/globals.css` |
| Sharing image | `scripts/og.html`, rendered to `public/og.png` by `node scripts/og.js` |

## Rules for the copy

- Every number and every named client must be something that can be sourced and explained in an interview.
- Docs about an employer's or client's system stay at the level of patterns: no service names, endpoints, business rules, thresholds or timings.
- A doc labelled "Reference design" is an original design for a class of problem. It does not describe a client's system.
