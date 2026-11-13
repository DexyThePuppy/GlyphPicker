<script setup lang="ts">
import { publicUrl } from '~/utils/publicUrl'

const { collection, isMaterial, materialStyle, materialWeight, materialFill,
  materialGrade, materialOpticalSize } = useCatalog()
const styles = ['rounded', 'outlined', 'sharp']
const fontUrl = computed(() => publicUrl(`fonts/material/MaterialSymbols${materialStyle.value[0]!.toUpperCase()}${materialStyle.value.slice(1)}.ttf`))
</script>

<template>
  <div class="font-controls">
    <label>Collection
      <select v-model="collection">
        <option value="glyph">Glyph Face</option>
        <option value="material">Material Symbols</option>
      </select>
    </label>
    <template v-if="isMaterial">
      <label>Style
        <select v-model="materialStyle">
          <option v-for="style in styles" :key="style" :value="style">{{ style[0]!.toUpperCase() + style.slice(1) }}</option>
        </select>
      </label>
      <label>Weight <output>{{ materialWeight }}</output>
        <input v-model.number="materialWeight" aria-label="Material weight" type="range" min="100" max="700" step="1">
      </label>
      <label>Fill <output>{{ materialFill }}</output>
        <input v-model.number="materialFill" aria-label="Material fill" type="range" min="0" max="1" step="0.01">
      </label>
      <label>Grade <output>{{ materialGrade }}</output>
        <input v-model.number="materialGrade" aria-label="Material grade" type="range" min="-50" max="200" step="1">
      </label>
      <label>Optical size <output>{{ materialOpticalSize }}</output>
        <input v-model.number="materialOpticalSize" aria-label="Material optical size" type="range" min="20" max="48" step="1">
      </label>
      <a :href="fontUrl" download>Download TTF</a>
      <a :href="publicUrl('pack/material-symbols-ttf.zip')" download>All 3 TTFs</a>
    </template>
  </div>
</template>
