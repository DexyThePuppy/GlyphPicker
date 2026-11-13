<script setup lang="ts">
import type { SymbolEntry } from '~/utils/types'

const CHUNK = 320

const {
  visibleSymbols,
  browseMode,
  activeCategoryId,
  activeCategoryTitle,
  showNames,
  selected,
  collection,
  materialStyle,
} = useCatalog()
const { copyValue } = useCopy()

const limit = ref(CHUNK)
const gridKey = computed(() =>
  `${collection.value}:${materialStyle.value}:${browseMode.value ? `cat:${activeCategoryId.value}` : 'search'}`,
)

watch([gridKey, visibleSymbols], () => {
  limit.value = CHUNK
})

const shown = computed(() => visibleSymbols.value.slice(0, limit.value))

const statusText = computed(() => {
  const total = visibleSymbols.value.length
  if (total === 0) return browseMode.value ? 'No glyphs' : '0 matches'
  const scope = browseMode.value ? activeCategoryTitle.value : 'Search'
  const counted = browseMode.value
    ? `${total.toLocaleString()} glyphs`
    : `${total.toLocaleString()} matches`
  return `${scope} · ${counted}`
})

const sentinel = ref<HTMLElement | null>(null)
useIntersectionObserver(
  sentinel,
  (entries) => {
    if (entries.some((e) => e.isIntersecting) && limit.value < visibleSymbols.value.length) {
      limit.value += CHUNK
    }
  },
  { rootMargin: '800px' },
)

function pick(symbol: SymbolEntry): void {
  selected.value = symbol
  void copyValue('character', symbol.char)
}
</script>

<template>
  <div>
    <p class="status" role="status">{{ statusText }}</p>
    <div v-if="visibleSymbols.length === 0" class="empty">
      No glyphs match your search.
    </div>
    <template v-else>
      <div :key="gridKey" class="grid" :class="{ 'grid--compact': !showNames }">
        <IconCell
          v-for="(symbol, i) in shown"
          :key="symbol.name"
          v-memo="[symbol, symbol.name === selected?.name]"
          :symbol="symbol"
          :selected="symbol.name === selected?.name"
          :style="{ '--d': `${Math.min(i, 40) * 9}ms` }"
          @pick="pick"
        />
      </div>
      <div ref="sentinel" class="sentinel" aria-hidden="true" />
    </template>
  </div>
</template>
