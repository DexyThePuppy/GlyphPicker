#!/usr/bin/env python3
"""Build Material catalogs and publish the original variable TTF assets offline."""
import json
import shutil
import zipfile
from pathlib import Path
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'fonts' / 'material'
PUBLIC = ROOT / 'public'


def build_categories(catalogs):
    data = ROOT / 'data' / 'material'
    upstream = json.loads((data / 'categories.google.json').read_text(encoding='utf-8'))
    config = json.loads((data / 'categories.config.json').read_text(encoding='utf-8'))
    direct = upstream['categories']
    overrides = config['overrides']
    valid = {row['id'] for row in config['order']}
    mapped = {}
    for catalog in catalogs.values():
        # Resolve aliases from the bundled font's own codepoints. Upstream
        # metadata can use different codepoints from this pinned font revision.
        by_code = {s['code']: direct[s['name']] for s in catalog['symbols']
                   if s['name'] in direct}
        for symbol in catalog['symbols']:
            name = symbol['name']
            category = overrides.get(name) or direct.get(name) or by_code.get(symbol['code'])
            if category not in valid:
                raise ValueError(f'Material category missing or invalid: {name}: {category}')
            if name in mapped and mapped[name] != category:
                raise ValueError(f'Material category differs across styles: {name}')
            mapped[name] = category
    payload = dict(source=upstream['source'], order=config['order'], hidden=[], symbols=mapped)
    (PUBLIC / 'material-categories.json').write_text(
        json.dumps(payload, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(f'Material categories: {len(mapped)} names mapped into {len(valid)} categories')


def main():
    target = PUBLIC / 'fonts' / 'material'
    target.mkdir(parents=True, exist_ok=True)
    catalogs = {}
    for style in ('Outlined', 'Rounded', 'Sharp'):
        stem = f'MaterialSymbols{style}'
        with TTFont(SOURCE / f'{stem}.ttf') as font:
            cmap = font.getBestCmap()
            axes = {a.axisTag: [a.minValue, a.defaultValue, a.maxValue]
                    for a in font['fvar'].axes}
            assert set(axes) == {'FILL', 'GRAD', 'opsz', 'wght'}, axes
            symbols = []
            for line in (SOURCE / f'{stem}.codepoints').read_text().splitlines():
                name, value = line.split()
                code = int(value, 16)
                if code not in cmap:
                    raise ValueError(f'{style}: missing {name} ({value})')
                symbols.append(dict(name=name, code=code, hex=f'U+{code:X}',
                                    char=chr(code), inFont=True))
        catalogs[style.lower()] = dict(version='1.0', fontFamily=f'Material Symbols {style}',
                                      total=len(symbols), inFont=len(symbols), symbols=symbols,
                                      axes=axes)
        print(f'{style}: {len(symbols)} icon names, {len({s["code"] for s in symbols})} codepoints; {axes}')
    build_categories(catalogs)
    for path in SOURCE.iterdir():
        if path.is_file() and path.suffix in ('.ttf', '.codepoints', '.txt', ''):
            shutil.copy2(path, target / path.name)
    (PUBLIC / 'material-symbols.json').write_text(
        json.dumps(catalogs, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    # Independent redistributable pack: original TTFs plus license and name indexes.
    pack = PUBLIC / 'pack' / 'material-symbols-ttf.zip'
    pack.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(pack, 'w', zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(target.iterdir()):
            archive.write(path, path.name)


if __name__ == '__main__':
    main()
