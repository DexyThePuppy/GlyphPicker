<script setup lang="ts">
import { WEIGHTS, weightAt } from '~/utils/weights'

const { weightIndex, glyphByName } = useCatalog()
const weight = computed(() => weightAt(weightIndex.value))

function glyph(name: string, fallback = '•'): string {
  return glyphByName.value.get(name) || fallback
}
</script>

<template>
  <div class="weight" :title="`${weight.label} · ${weight.weight}`">
    <span class="weight-icon glyph" aria-hidden="true">{{ glyph('lineweight') }}</span>
    <input
      v-model.number="weightIndex"
      type="range"
      min="0"
      :max="WEIGHTS.length - 1"
      step="1"
      :aria-label="`Weight: ${weight.label}`"
    />
    <span class="weight-label">{{ weight.label }}</span>
  </div>
</template>
