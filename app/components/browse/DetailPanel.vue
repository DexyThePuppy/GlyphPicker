<script setup lang="ts">
import { prettyLabel } from '~/utils/names'

const { selected, synonyms } = useCatalog()
const { copyValue } = useCopy()

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
