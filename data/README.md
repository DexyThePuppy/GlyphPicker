# Data sources (private)

Local inputs used by `npm run build:data`. Do not redistribute proprietary assets.

```
data/
  namings.json              Search synonyms (source of truth → public/namings.json)
  catalog/
    names.txt               Glyph names (one per line)
    symbols.txt             Matching characters (one per line)
    categories.full.json    Category membership
    categories.meta.json    Category icons / titles
  pack/                     Extra text files bundled into glyph-pack.zip
```

Rebuild published JSON + fonts:

```bash
npm run build:data
```
