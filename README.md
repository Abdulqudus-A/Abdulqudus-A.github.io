# Abdulqudus Aremu: personal site

Source for my personal site. Next.js (App Router), exported as static HTML.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in ./out
```

## Where things live

- `src/content/site.ts`: every word and number on the site. Edit copy here, not in the markup.
- `src/app/page.tsx`: the homepage.
- `src/app/globals.css`: design tokens and all styles.
- `src/components/RecoveryFigure.tsx`: the checkpoint-recovery figure (to become the interactive demo).
- `src/app/fonts/`: self-hosted Source Serif 4 and IBM Plex Mono (SIL Open Font License).

## Content rules

- Every number has a source that can be explained in an interview.
- Clients and products may be named. Internal repository names, ticket numbers and fraud-control rules are not published.
- Shared work is marked as shared.
