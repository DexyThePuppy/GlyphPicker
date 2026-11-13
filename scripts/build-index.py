#!/usr/bin/env python3
"""Build public catalog assets from data/catalog + fonts."""

from __future__ import annotations

import json
import shutil
import runpy
from pathlib import Path

try:
    from fontTools.ttLib import TTFont
except ImportError as exc:
    raise SystemExit("Install fonttools: pip install fonttools") from exc

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data" / "catalog"
DATA = ROOT / "data"
PUBLIC = ROOT / "public"
FONTS = ROOT / "fonts"
FONT_FILE = FONTS / "GlyphFace-Regular.otf"
FONT_GLOB = "GlyphFace-*.otf"
FONT_FAMILY = "Glyph Face"


def sync_namings() -> None:
    src = DATA / "namings.json"
    if not src.exists():
        raise SystemExit(f"Missing {src}")
    dst = PUBLIC / "namings.json"
    shutil.copy2(src, dst)
    print(f"Synced {dst.relative_to(ROOT)}")


def main() -> None:
    names_path = CATALOG / "names.txt"
    syms_path = CATALOG / "symbols.txt"
    if not names_path.exists() or not syms_path.exists():
        raise SystemExit(f"Missing catalog texts in {CATALOG}")

    names = names_path.read_text(encoding="utf-8").strip().splitlines()
    syms = [
        line.strip()
        for line in syms_path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    if len(names) != len(syms):
        raise SystemExit(f"name/symbol mismatch: {len(names)} vs {len(syms)}")

    if not FONT_FILE.exists():
        raise SystemExit(f"Missing font: {FONT_FILE}")

    font = TTFont(str(FONT_FILE))
    cmap = font.getBestCmap()
    font.close()

    symbols = []
    for name, char in zip(names, syms):
        code = ord(char)
        symbols.append(
            {
                "name": name,
                "code": code,
                "hex": f"U+{code:X}",
                "char": char,
                "inFont": code in cmap,
            }
        )

    payload = {
        "version": "1.0",
        "fontFamily": FONT_FAMILY,
        "total": len(symbols),
        "inFont": sum(1 for s in symbols if s["inFont"]),
        "symbols": symbols,
    }

    PUBLIC.mkdir(exist_ok=True)
    out = PUBLIC / "symbols.json"
    out.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    font_out = PUBLIC / "fonts"
    if font_out.exists():
        shutil.rmtree(font_out)
    font_out.mkdir(parents=True)
    for otf in FONTS.glob(FONT_GLOB):
        shutil.copy2(otf, font_out / otf.name)

    sync_namings()
    runpy.run_path(str(ROOT / 'scripts' / 'build-material.py'), run_name='__main__')

    copied = len(list(font_out.glob("*.otf")))
    print(f"Wrote {out.relative_to(ROOT)} ({payload['total']} symbols, {payload['inFont']} in font)")
    print(f"Copied {copied} fonts to {font_out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
