#!/usr/bin/env python3
"""Convert GlyphFace OTFs → TTF and pack fonts + text dumps into public/pack/glyph-pack.zip."""

from __future__ import annotations

import zipfile
from pathlib import Path

from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont, newTable
from fontTools.ttLib.tables._g_l_y_f import Glyph

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / "fonts"
TTF_DIR = FONTS / "ttf"
CATALOG = ROOT / "data" / "catalog"
PACK_TXT = ROOT / "data" / "pack"
OUT_ZIP = ROOT / "public" / "pack" / "glyph-pack.zip"

# (source path, zip arcname under txt/)
TXT_ENTRIES = [
    (CATALOG / "names.txt", "names.txt"),
    (CATALOG / "symbols.txt", "symbols.txt"),
    (PACK_TXT / "multicolor.txt", "multicolor.txt"),
    (PACK_TXT / "_families.txt", "_families.txt"),
    (PACK_TXT / "names.missing-localized.txt", "names.missing-localized.txt"),
    (PACK_TXT / "names.symbol-order-full.txt", "names.symbol-order-full.txt"),
]


def otf_to_ttf(src: Path, dst: Path) -> None:
    font = TTFont(str(src))
    glyph_set = font.getGlyphSet()
    order = font.getGlyphOrder()

    glyf = newTable("glyf")
    glyf.glyphs = {}
    glyf.glyphOrder = order

    for name in order:
        pen = TTGlyphPen(glyf.glyphs)
        try:
            glyph_set[name].draw(Cu2QuPen(pen, max_err=1.0, reverse_direction=True))
            glyf[name] = pen.glyph()
        except Exception:
            glyf[name] = Glyph()

    for tag in ("CFF ", "CFF2", "VORG"):
        if tag in font:
            del font[tag]

    font["glyf"] = glyf
    font["loca"] = newTable("loca")
    font["maxp"].tableTag = "maxp"
    font["maxp"].version = 0x00010000
    font["maxp"].numGlyphs = len(order)

    dst.parent.mkdir(parents=True, exist_ok=True)
    font.save(str(dst))
    font.close()


def main() -> None:
    otfs = sorted(FONTS.glob("GlyphFace-*.otf"))
    if not otfs:
        raise SystemExit(f"No GlyphFace-*.otf in {FONTS}")

    TTF_DIR.mkdir(parents=True, exist_ok=True)
    ttfs: list[Path] = []
    for otf in otfs:
        ttf = TTF_DIR / (otf.stem + ".ttf")
        if ttf.exists() and ttf.stat().st_mtime >= otf.stat().st_mtime:
            print(f"skip convert {otf.name}")
        else:
            print(f"convert {otf.name} -> {ttf.name}")
            otf_to_ttf(otf, ttf)
        ttfs.append(ttf)

    OUT_ZIP.parent.mkdir(parents=True, exist_ok=True)
    if OUT_ZIP.exists():
        OUT_ZIP.unlink()

    with zipfile.ZipFile(
        OUT_ZIP,
        "w",
        compression=zipfile.ZIP_DEFLATED,
        compresslevel=6,
    ) as zf:
        for otf in otfs:
            zf.write(otf, f"otf/{otf.name}")
            print(f"  + otf/{otf.name}")
        for ttf in ttfs:
            zf.write(ttf, f"ttf/{ttf.name}")
            print(f"  + ttf/{ttf.name}")
        for path, arcname in TXT_ENTRIES:
            if path.exists():
                zf.write(path, f"txt/{arcname}")
                print(f"  + txt/{arcname}")
            else:
                print(f"  ! missing {path}")

    mb = OUT_ZIP.stat().st_size / (1024 * 1024)
    print(f"Wrote {OUT_ZIP} ({mb:.1f} MB)")


if __name__ == "__main__":
    main()
