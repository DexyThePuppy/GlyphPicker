<script setup lang="ts">
import { prettyLabel, shortLabel } from '~/utils/names'
import type { SymbolEntry } from '~/utils/types'

const props = defineProps<{
  symbol: SymbolEntry
  selected: boolean
}>()

const emit = defineEmits<{ pick: [symbol: SymbolEntry] }>()

const tooltip = computed(() => `${prettyLabel(props.symbol.name)}\n${props.symbol.name}`)
</script>

<template>
  <button
    type="button"
    class="cell"
    :class="{ missing: !symbol.inFont }"
    :title="tooltip"
    :aria-selected="selected"
    @click="emit('pick', symbol)"
  >
    <span class="glyph">{{ symbol.char }}</span>
    <span class="cell-name">{{ shortLabel(symbol.name) }}</span>
  </button>
</template>
