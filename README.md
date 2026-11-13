# GlyphPicker

Nuxt SPA to browse and copy icon glyphs — weight slider, smart search,
category tabs, motion, and UI sounds.

**Live:** https://DexyThePuppy.github.io/GlyphPicker/

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

Material Symbols is available in the collection selector with Rounded, Outlined,
and Sharp styles. Each uses Google's original variable **TTF** with continuous
fill (0–1), weight (100–700), grade (-50–200), and optical size (20–48) controls.
Download the selected TTF or all three TTFs with the Apache 2.0 license and
codepoint indexes. No WOFF/WOFF2 assets are bundled. A copied character requires
the matching font; use **Copy font settings** to retain the selected axes in CSS.

Sources and the pinned upstream commit are in `fonts/material/SOURCE.txt`.
The offline build validates every icon name against its font's cmap and copies
the original fonts without conversion. Icon aliases that share a codepoint stay
searchable by name. The existing Glyph Face collection remains available.
Material Symbols uses Google's 18 categories in the sidebar and mobile drawer.
All bundled names are mapped, including older aliases; the category sources and
explicit overrides are documented in `data/material/README.md`.

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
| `npm run build:material` | Validate Material Symbols, build catalog, copy TTFs and build its download pack |
| `npm run build:categories` | Rebuild `categories.json` |
| `npm run build:pack` | OTF→TTF + `public/pack/glyph-pack.zip` |
| `npm run build:data` | index + categories + pack |
| `python scripts/make-sounds.py` | Regenerate UI wavs |

## Deploy (GitHub Pages)

Pushes to `main` / `master` run [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
(same Actions → Pages flow as the Portfolio repo).

1. Repo **Settings → Pages → Source: GitHub Actions**
2. Push to `main` or `master` (or run the workflow manually)
3. Site: `https://DexyThePuppy.github.io/GlyphPicker/`

The downloadable `glyph-pack.zip` is gitignored and not published on Pages (build it locally with `npm run build:pack`).
The separate `material-symbols-ttf.zip` is generated automatically and published
on Pages. `dev`, `build`, and `generate` rebuild the font catalogs first and
require Python with `fonttools` installed.

## Notes

Generated packs live under `public/pack/` (gitignored).
Do not redistribute proprietary font assets.
