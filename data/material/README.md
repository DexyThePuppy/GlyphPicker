# Material Symbols categories

`categories.google.json` is a compact snapshot of Google Fonts icon metadata,
retaining category names for entries supporting Material Symbols Rounded.
The source URL and retrieval date are recorded in the file. Legacy Material Icons
entries are excluded using the metadata's `unsupported_families` field.

`categories.config.json` defines the 18 category labels, their display order,
and chrome icons from Glyph Face. Its explicit overrides cover older names that
have neither a current metadata entry nor a categorized alias in the bundled font.

`scripts/build-material.py` resolves each bundled name by override, upstream name,
then shared codepoint within the bundled font. It fails on missing mappings,
unknown category IDs, or disagreements between styles. Nothing is fetched during
builds. All icons stay visible; no Material categories are hidden.

To update the snapshot, fetch its recorded Google Fonts metadata URL, strip the
anti-XSSI prefix before parsing JSON, and retain the first category for entries
where `unsupported_families` does not contain `Material Symbols Rounded`.
Rebuild with `npm run build:material` and review any missing-name errors.
