# GlyphPicker

Private Nuxt app to browse and copy icon glyphs — weight slider, smart search,
category tabs, motion, and UI sounds.

## Structure

```
app/
  app.vue                 Shell layout
  assets/main.css         Styles
  components/
    browse/               Grid, cells, categories, detail
    chrome/               Search/weight toolbar, side tools, toast
  composables/            Shared state (catalog, toast, sounds, copy)
  utils/                  Search, labels, categories, weights
data/
  namings.json            Search synonyms (source)
  catalog/                Names, symbols, category membership
  pack/                   Extra texts for the download zip
fonts/                    GlyphFace-*.otf (source faces)
public/
  symbols.json            Built catalog
  categories.json         Built category map
  namings.json            Copied from data/
  sounds/                 UI sound effects
  fonts/                  Copied at build time (gitignored)
  pack/                   glyph-pack.zip (gitignored)
scripts/                  Python build pipeline
```

## Setup

```bash
npm install
pip install fonttools cu2qu
npm run build:data
npm run dev
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server → http://localhost:5173 |
| `npm run build` | Static site → `.output/public` |
| `npm run build:index` | `symbols.json` + copy fonts + sync namings |
| `npm run build:categories` | Rebuild `categories.json` |
| `npm run build:pack` | OTF→TTF + `public/pack/glyph-pack.zip` |
| `npm run build:data` | index + categories + pack |
| `python scripts/make-sounds.py` | Regenerate UI wavs |

## Notes

Keep fonts and raw dumps local. Generated packs live under `public/pack/` (gitignored).
Do not redistribute proprietary font assets.
