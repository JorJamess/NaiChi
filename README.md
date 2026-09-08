# NaiChi — Birchdale Farm Dashboard

A single-page, static UI demo of a cozy farm-game dashboard called **Birchdale** — sidebar navigation, an animated hero banner, and a card grid covering farm overview, tasks, collections, neighbors, photos, the farm map, and notes.

Built with plain **HTML / CSS / JavaScript** — no framework, no build step, no dependencies.

## Features

- Animated SVG hero banner (sky, lake, wheat field, cottage) with a live clock
- Sidebar navigation that filters the dashboard down to the matching card (Home shows everything)
- Light/dark theme toggle, persisted in `localStorage`
- A working monthly calendar widget (real date math, not a mockup)
- Task, collection, neighbor, and note data rendered from a single JS `DATA` object — easy to edit or swap for a real API later
- Search/filter box for notes
- Scroll-triggered card reveal animation (`IntersectionObserver`)
- Responsive layout down to mobile, with `prefers-reduced-motion` support

## Running it

No build tools required. Either:

- Open `index.html` directly in a browser, or
- Serve the folder with any static server, e.g.:

  ```bash
  python3 -m http.server 8000
  ```

  then visit `http://localhost:8000`.

## Project structure

```
index.html   Page structure and markup
style.css    Styling, theming (light/dark), layout, animations
script.js    Interactivity: nav filtering, rendering, calendar, theme, reveal
```

## Notes

- All data (tasks, collections, neighbors, notes) is mock data defined in `script.js`'s `DATA` object — nothing is persisted except the theme choice and the last-selected sidebar tab.
- The in-game date shown in the hero banner is intentionally fixed (see `CONFIG.gameDateLabel` in `script.js`); only the clock time is live.
