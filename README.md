# Matt’s Fragrances

A personal fragrance wardrobe built around the pleasure of browsing bottles. A restrained charcoal gallery separates **Collection**, **Wishlist**, and **Archive**, with full-color owned bottles, recognizable locked wishlist photography, and quieter historical bottles.

Built with React, strict TypeScript, Vite, Tailwind CSS 4, and Lucide React. No backend, account, runtime catalog scraping, or external API.

## Run locally

Requires Node.js **22.12+** (or a supported newer version) and npm.

```sh
npm install
npm run dev
```

Open the URL printed by Vite. If another app uses IPv6 localhost on the same port, use the printed port with `http://127.0.0.1`.

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

Production files are generated in `dist/`. Any static host can serve them. The app has no client-side page routes or server dependencies. GitHub Actions runs the unit tests and production build on pushes and pull requests.

## V1 experience

- Large bottle gallery with a responsive two-column phone shelf, three-column tablet shelf, and four-column desktop shelf.
- Native modal dialogs with focus containment, Escape, close controls, and backdrop dismissal; an editorial photo/profile split on desktop and a stacked sheet on phones.
- Add and edit bottles, including brand, name, concentration, image, profile, comma-separated notes, and one overall rating from 0–10.
- Move any bottle among shelves. Acquiring a wishlist bottle reveals its full-color Collection treatment and a brief acquisition message. Archiving opens the form for an optional exit reason and rebuy preference.
- Wishlist fields: priority (1 is highest), target price in USD, sampled, reason wanted, and next buy. Unknown values remain unset; **No** and **Not set** are distinct.
- Only user-created bottles can be deleted, after explicit confirmation inside the editor.
- “Pick for Me” selects only owned bottles, gives a short reveal, and avoids the previous result when multiple bottles are available. It uses ordinary random selection.
- Reduced-motion support, visible keyboard focus, semantic controls, useful image alternatives, and graceful missing-image/empty-shelf states.

## Data and architecture

`src/types.ts` defines one `Fragrance` model with a status and optional wishlist/archive metadata. `src/data/seed.ts` is the single, easy-to-edit seed dataset. Components in `src/components/` own the gallery, image presentation, dialogs, forms, and picker. `src/lib/useWardrobe.ts` centralizes app state; `src/lib/persistence.ts` owns the versioned localStorage envelope and runtime validation; `src/lib/picker.ts` keeps selection logic independent of presentation.

The [authoritative wardrobe](https://www.fragrantica.com/@mattchantelois#wardrobe) was inspected in the browser on **October 5, 2026**. All **36** entries are seeded: **10 owned, 23 wishlist, 3 archived**, in source order. Ventana Pour Homme is listed as owned in the live wardrobe, so that status is preserved despite earlier context suggesting it had been disliked. No personal ratings, exit reasons, purchase details, or opinions have been invented. Only the explicitly identified concentrations (Eros EDP, Y EDP, and MYSLF Eau de Toilette Intense) are seeded; other concentrations and scent descriptions are left for editing.

### Persistence and developer reset

On the first visit, defaults seed a version-1 envelope under `matts-fragrances:wardrobe`. After that, saved records take precedence, including an intentionally empty wardrobe. Runtime validation checks records, optional metadata, ratings, and unique IDs. Unreadable or unsupported-version data is preserved without overwriting it; the app displays a warning and runs with temporary seed state. Failed writes also display a warning. Local data belongs to the current browser and origin, and is not synced or backed up.

To inspect or back up your raw saved data, use your browser’s developer tools → Application/Storage → Local Storage. To reset **only this app’s wardrobe**, export the value first if desired, then run this in the browser console and reload:

```js
localStorage.removeItem('matts-fragrances:wardrobe');
location.reload();
```

This reset is deliberately absent from the main interface. Seed edits do not override an existing saved wardrobe. When changing the schema, introduce an explicit migration and increment the version; unsupported versions remain protected until a migration exists.

### Photography and limitations

All 36 bottles use **local real product photography** in `public/images/`. Nothing hotlinks Fragrantica and no images are generated. `public/images/sources.json` records each source product page, original image URL, local file, and processing notes. Images come from publicly accessible brand and retailer product pages, predominantly PerfumeOnline, with additional photos from YSL Beauty, Maison Asrar, Riiffs, and other retailers. Source photos were cropped/masked to separate bottles from packaging, preserve glass highlights, and produce proportion-preserving WebP assets.

Photo rights remain with their respective owners. Public accessibility does not establish a redistribution license; explicit permissions have not been verified. For public/commercial publication, obtain permission or replace these personal-prototype assets with owned/licensed bottle photographs. Some cutout edges and image resolutions can be improved with better source photography. Bottle packaging and presentation may vary by size or batch. External image URLs entered by the user must use HTTPS and will contact that image host; local `/images/` paths also work. Ratings are never filled in just to make the gallery look complete.

## Verification

Nine unit tests cover seed completeness, first-run hydration, editable metadata round trips, intentionally empty saved collections, malformed and future-version storage, duplicate IDs, invalid optional fields, blocked/quota-limited storage, and owned-only selection. Strict TypeScript and a production build are required in CI. Browser checks cover mobile/desktop layout, image loading, dialog keyboard behavior, edits and reload persistence, acquisition, archiving, deletion, and the picker.

## Sensible V2 work

Explicit JSON import/export and migrations; replacing prototype photography with licensed/owned higher-resolution images; improved note authoring; and optional user-controlled rules for the picker. Keep the gallery at the center of the experience.
