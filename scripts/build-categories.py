#!/usr/bin/env python3
"""Build public/categories.json from local category membership data.

Meta categories (all / what's new / variable / multicolor / draw) are skipped.
Indices and Currencies are kept in the map but hidden from browse.
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data" / "catalog"
PUBLIC = ROOT / "public"

META = {"all", "whatsnew", "draw", "variable", "multicolor"}

# Browse order (minus meta / hidden).
DISPLAY_ORDER = [
    ("communication", "Communication", "message"),
    ("weather", "Weather", "cloud.sun"),
    ("maps", "Maps", "map"),
    ("objectsandtools", "Objects & Tools", "folder"),
    ("devices", "Devices", "desktopcomputer"),
    ("cameraandphotos", "Camera & Photos", "camera"),
    ("gaming", "Gaming", "gamecontroller"),
    ("connectivity", "Connectivity", "antenna.radiowaves.left.and.right"),
    ("transportation", "Transportation", "car.fill"),
    ("automotive", "Automotive", "steeringwheel"),
    ("accessibility", "Accessibility", "accessibility"),
    ("privacyandsecurity", "Privacy & Security", "lock"),
    ("human", "People", "person.crop.circle"),
    ("home", "Home", "house"),
    ("fitness", "Fitness", "figure.run"),
    ("nature", "Nature", "leaf"),
    ("editing", "Editing", "slider.horizontal.3"),
    ("textformatting", "Text Formatting", "textformat"),
    ("media", "Media", "playpause"),
    ("keyboard", "Keyboard", "command"),
    ("commerce", "Commerce", "cart"),
    ("time", "Time", "timer"),
    ("health", "Health", "heart"),
    ("shapes", "Shapes", "square.on.circle"),
    ("arrows", "Arrows", "arrow.forward"),
    ("math", "Math", "x.squareroot"),
]

# When a symbol is in several categories, first hit wins.
PRIORITY = [
    "weather",
    "automotive",
    "transportation",
    "home",
    "fitness",
    "gaming",
    "accessibility",
    "human",
    "health",
    "nature",
    "cameraandphotos",
    "devices",
    "connectivity",
    "privacyandsecurity",
    "maps",
    "time",
    "editing",
    "commerce",
    "media",
    "communication",
    "objectsandtools",
    "textformatting",
    "keyboard",
    "shapes",
    "arrows",
    "math",
    "indices",
]

HIDDEN = {"indices", "currencies"}


def is_currency(name: str) -> bool:
    base = name.split(".")[0]
    return base.endswith("sign") or "currencysign" in base


def pick(cats: list[str]) -> str | None:
    for cid in PRIORITY:
        if cid in cats:
            return cid
    return cats[0] if cats else None


def main() -> None:
    full_path = CATALOG / "categories.full.json"
    if not full_path.exists():
        raise SystemExit(f"Missing {full_path}")

    full = json.loads(full_path.read_text(encoding="utf-8"))
    sym_cats: dict[str, list[str]] = defaultdict(list)
    for cat in full["categories"]:
        key = cat["key"]
        if key in META:
            continue
        for name in cat["symbols"]:
            if key not in sym_cats[name]:
                sym_cats[name].append(key)

    catalog = json.loads((PUBLIC / "symbols.json").read_text(encoding="utf-8"))
    names = [s["name"] for s in catalog["symbols"]]

    result: dict[str, str] = {}
    stats = Counter()
    for name in names:
        if is_currency(name):
            result[name] = "currencies"
            stats["currency"] += 1
            continue
        chosen = pick(sym_cats.get(name, []))
        if chosen:
            result[name] = chosen
            stats["direct"] += 1
        else:
            result[name] = "other"
            stats["other"] += 1

    # Prefer icons from categories.meta.json when present
    icon_by_id = {cid: icon for cid, _title, icon in DISPLAY_ORDER}
    meta_path = CATALOG / "categories.meta.json"
    if meta_path.exists():
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        for cat in meta.get("categories", []):
            key = cat.get("key")
            if key in icon_by_id and cat.get("icon"):
                icon_by_id[key] = cat["icon"]

    payload = {
        "source": "local",
        "order": [
            {"id": cid, "title": title, "icon": icon_by_id[cid]}
            for cid, title, _icon in DISPLAY_ORDER
        ],
        "hidden": sorted(HIDDEN),
        "symbols": result,
    }
    out = PUBLIC / "categories.json"
    out.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    in_font = {s["name"] for s in catalog["symbols"] if s["inFont"]}
    counts = Counter(cid for n, cid in result.items() if n in in_font)
    print(f"Assignment: {dict(stats)}")
    print(
        f"Wrote {out.name} — {len(DISPLAY_ORDER)} browse cats "
        f"(hidden indices={counts['indices']}, currencies={counts['currencies']})"
    )
    for cid, title, _icon in DISPLAY_ORDER:
        if counts[cid]:
            print(f"  {title}: {counts[cid]}")
    if counts["other"]:
        print(f"  Other: {counts['other']}")


if __name__ == "__main__":
    main()
