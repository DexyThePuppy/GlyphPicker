<script setup lang="ts">
import { glyphToSvg, loadFont, svgToPng } from '~/utils/glyphSvg'
import { prettyLabel } from '~/utils/names'
import { publicUrl } from '~/utils/publicUrl'
import { weightAt } from '~/utils/weights'

const { selected, synonyms, isMaterial, catalog, materialStyle, materialWeight, materialFill,
  materialGrade, materialOpticalSize, weightIndex } = useCatalog()
const axisSettings = computed(() => `"FILL" ${materialFill.value}, "wght" ${materialWeight.value}, "GRAD" ${materialGrade.value}, "opsz" ${materialOpticalSize.value}`)
const { copyValue, copySvg, copyPng } = useCopy()

/** The font file currently used to render glyphs (matches the @font-face in app.vue). */
const fontUrl = computed(() => isMaterial.value
  ? publicUrl(`fonts/material/MaterialSymbols${materialStyle.value[0]!.toUpperCase()}${materialStyle.value.slice(1)}.ttf`)
  : publicUrl(`fonts/${weightAt(weightIndex.value).file}`))

const svgHint = computed(() => isMaterial.value
  ? `${materialOpticalSize.value}px · wght ${materialWeight.value} · fill ${materialFill.value}`
  : `${weightAt(weightIndex.value).label} · for Figma, Illustrator…`)

/** Longest-side sizes offered for copied PNGs, in px. */
const PNG_SIZES = [128, 256, 512, 1024] as const

function selectedSvg(): Promise<string> | null {
  const symbol = selected.value
  if (!symbol) return null
  return glyphToSvg(isMaterial.value
    ? {
        fontUrl: fontUrl.value,
        codePoint: symbol.code,
        variation: { FILL: materialFill.value, wght: materialWeight.value, GRAD: materialGrade.value, opsz: materialOpticalSize.value },
        // Material icons are drawn on a square grid; keep it so padding/alignment survive.
        frame: 'em',
        emPx: materialOpticalSize.value,
      }
    : { fontUrl: fontUrl.value, codePoint: symbol.code, frame: 'tight', emPx: 32 })
}

function copySelectedSvg(): void {
  const svg = selectedSvg()
  if (svg) void copySvg('SVG', svg)
}

function copySelectedPng(size: number): void {
  const svg = selectedSvg()
  if (svg) void copyPng(`${size}px PNG`, svg.then((markup) => svgToPng(markup, size)))
}

/** Start fetching/parsing the font on hover so the copy itself is instant. */
function prefetchFont(): void {
  loadFont(fontUrl.value).catch(() => {})
}

const jsEscape = computed(() =>
  selected.value ? `\\u{${selected.value.code.toString(16).toUpperCase()}}` : '',
)
const htmlEntity = computed(() =>
  selected.value ? `&#x${selected.value.code.toString(16).toUpperCase()};` : '',
)

const aliases = computed(() => {
  const symbol = selected.value
  if (!symbol) return []
  const n = symbol.name.toLowerCase()
  return Object.entries(synonyms.value)
    .filter(([, values]) =>
      values.some((v) => {
        const needle = v.toLowerCase()
        return n === needle || n.startsWith(needle + '.') || n.includes('.' + needle) || n.includes(needle)
      }),
    )
    .map(([key]) => key)
    .slice(0, 12)
})

const kvRows = computed<Array<[string, string]>>(() => {
  const symbol = selected.value
  if (!symbol) return []
  return [
    ['Name', symbol.name],
    ...(isMaterial.value ? [
      ['Font', catalog.value?.fontFamily ?? ''],
      ['Axes', axisSettings.value],
    ] as Array<[string, string]> : []),
    ['Unicode', symbol.hex],
    ['Code point', String(symbol.code)],
    ['JS escape', jsEscape.value],
    ['HTML entity', htmlEntity.value],
    ['Also called', aliases.value.length ? aliases.value.join(', ') : '—'],
  ]
})

const copyActions = computed<Array<[string, string, string]>>(() => {
  const symbol = selected.value
  if (!symbol) return []
  return [
    ['Copy name', 'name', symbol.name],
    ['Copy character', 'character', symbol.char],
    ['Copy unicode', 'unicode', symbol.hex],
    ['Copy JS escape', 'JS escape', jsEscape.value],
    ['Copy HTML entity', 'HTML entity', htmlEntity.value],
    ...(isMaterial.value ? [
      ['Copy font settings', 'font settings', `font-family: '${catalog.value?.fontFamily}'; font-variation-settings: ${axisSettings.value};`],
    ] as Array<[string, string, string]> : []),
  ]
})
</script>

<template>
  <aside
    v-motion
    class="detail"
    :initial="{ opacity: 0, x: 18 }"
    :enter="{ opacity: 1, x: 0, transition: { duration: 320 } }"
  >
    <div class="detail-preview">
      <Transition name="glyph-swap" mode="out-in">
        <div :key="selected?.code ?? 'none'" class="glyph">
          {{ selected?.char ?? '􀀀' }}
        </div>
      </Transition>
    </div>
    <Transition name="fade" mode="out-in">
      <h2 :key="selected?.name ?? 'none'">
        {{ selected ? prettyLabel(selected.name) : 'Select a glyph' }}
      </h2>
    </Transition>
    <div class="badge" :class="!selected || selected.inFont ? 'ok' : 'miss'">
      {{
        !selected
          ? 'Ready'
          : selected.inFont
            ? 'Present in bundled font'
            : 'Missing from this font version'
      }}
    </div>
    <div v-if="selected" class="kv">
      <div v-for="[k, v] in kvRows" :key="k" class="kv-row">
        <span>{{ k }}</span>
        <code>{{ v }}</code>
      </div>
    </div>
    <div v-if="selected" class="actions">
      <button
        type="button"
        @click="copySelectedSvg"
        @pointerenter="prefetchFont"
        @focus="prefetchFont"
      >
        <strong>Copy SVG</strong>
        <span>{{ svgHint }}</span>
      </button>
      <div class="action-group" role="group" aria-labelledby="copy-png-label">
        <div class="action-group-head">
          <strong id="copy-png-label">Copy PNG</strong>
          <span>Transparent background · px on longest side</span>
        </div>
        <div class="size-buttons">
          <button
            v-for="size in PNG_SIZES"
            :key="size"
            type="button"
            :aria-label="`Copy PNG at ${size} pixels`"
            @click="copySelectedPng(size)"
            @pointerenter="prefetchFont"
            @focus="prefetchFont"
          >
            {{ size }}
          </button>
        </div>
      </div>
      <button
        v-for="[title, label, value] in copyActions"
        :key="title"
        type="button"
        @click="copyValue(label, value)"
      >
        <strong>{{ title }}</strong>
        <span>{{ value }}</span>
      </button>
    </div>
  </aside>
</template>
