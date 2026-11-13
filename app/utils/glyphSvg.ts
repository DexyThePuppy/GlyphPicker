import type { Font } from 'fontkit'

/** Parsed fonts, keyed by URL. fontkit is imported lazily so it stays out of the main bundle. */
const fontCache = new Map<string, Promise<Font>>()

export function loadFont(url: string): Promise<Font> {
  let pending = fontCache.get(url)
  if (!pending) {
    pending = (async () => {
      const [{ create }, res] = await Promise.all([import('fontkit'), fetch(url)])
      if (!res.ok) throw new Error(`Failed to load font (${res.status})`)
      // fontkit 2 accepts any Uint8Array at runtime; the typings still say Buffer.
      const font = create(new Uint8Array(await res.arrayBuffer()) as Parameters<typeof create>[0])
      if ('fonts' in font) throw new Error('Font collections are not supported')
      return font
    })()
    pending.catch(() => fontCache.delete(url))
    fontCache.set(url, pending)
  }
  return pending
}

export interface GlyphSvgOptions {
  fontUrl: string
  codePoint: number
  /** Variable-font axis values, e.g. `{ wght: 400, FILL: 0 }`. */
  variation?: Record<string, number>
  /**
   * `em`: keep the full em square (Material icons are designed on that grid).
   * `tight`: crop the viewBox to the outline's bounding box.
   */
  frame: 'em' | 'tight'
  /** Rendered size of one em in px, used for the width/height attributes. */
  emPx: number
  title?: string
}

const round = (n: number) => Math.round(n * 100) / 100

function escapeXml(text: string): string {
  return text.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]!)
}

/** Builds a standalone SVG of one glyph's outline, suitable for pasting into Figma / Illustrator. */
export async function glyphToSvg(opts: GlyphSvgOptions): Promise<string> {
  let font = await loadFont(opts.fontUrl)
  if (opts.variation && Object.keys(font.variationAxes).length) {
    font = font.getVariation(opts.variation)
  }
  const glyph = font.glyphForCodePoint(opts.codePoint)
  if (!glyph || glyph.id === 0) throw new Error('Glyph not found in font')

  const upem = font.unitsPerEm
  const box = glyph.path.bbox
  // Frame origin (font units, y-up) and size. Fonts are y-up and SVG is y-down, so the path is
  // flipped and shifted so the frame's top-left lands on 0,0 — no transform attribute needed.
  const [left, top, w, h] = opts.frame === 'em'
    ? [0, upem, glyph.advanceWidth || upem, upem]
    : [box.minX, box.maxY, box.maxX - box.minX, box.maxY - box.minY]
  const d = glyph.path.scale(1, -1).translate(-left, top).toSVG()
    .replace(/-?\d+\.\d+/g, (n) => String(round(Number(n))))
  if (!d) throw new Error('Glyph has no outline')

  const scale = opts.emPx / upem
  const title = opts.title ? `<title>${escapeXml(opts.title)}</title>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${round(w * scale)}" height="${round(h * scale)}" `
    + `viewBox="0 0 ${round(w)} ${round(h)}">${title}<path d="${d}"/></svg>`
}
