import type { WeightOption } from './types'

/** Static icon faces served from /fonts. */
export const WEIGHTS: WeightOption[] = [
  { label: 'Ultralight', weight: 100, file: 'GlyphFace-Ultralight.otf' },
  { label: 'Thin', weight: 200, file: 'GlyphFace-Thin.otf' },
  { label: 'Light', weight: 300, file: 'GlyphFace-Light.otf' },
  { label: 'Regular', weight: 400, file: 'GlyphFace-Regular.otf' },
  { label: 'Medium', weight: 500, file: 'GlyphFace-Medium.otf' },
  { label: 'Semibold', weight: 600, file: 'GlyphFace-Semibold.otf' },
  { label: 'Bold', weight: 700, file: 'GlyphFace-Bold.otf' },
  { label: 'Heavy', weight: 800, file: 'GlyphFace-Heavy.otf' },
  { label: 'Black', weight: 900, file: 'GlyphFace-Black.otf' },
]

export const FONT_FAMILY = 'Glyph Face'

export function weightAt(index: number): WeightOption {
  return WEIGHTS[Math.min(Math.max(index, 0), WEIGHTS.length - 1)]!
}
