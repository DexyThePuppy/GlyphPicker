<script setup lang="ts">
import { FONT_FAMILY, WEIGHTS, weightAt } from '~/utils/weights'
import { publicUrl } from '~/utils/publicUrl'

const { load, loaded, error, browseMode, weightIndex } = useCatalog()
const { isMaterial, materialStyle, materialWeight, materialFill, materialGrade, materialOpticalSize } = useCatalog()
const symbolStyle = computed(() => isMaterial.value ? {
  '--symbol-font': `"Material Symbols ${materialStyle.value[0]!.toUpperCase()}${materialStyle.value.slice(1)}"`,
  '--symbol-weight': String(materialWeight.value),
  '--symbol-axes': `"FILL" ${materialFill.value}, "wght" ${materialWeight.value}, "GRAD" ${materialGrade.value}, "opsz" ${materialOpticalSize.value}`,
} : {})
const { showDetail, drawerMode } = useUiLayout()

const fontFaceCss = WEIGHTS.map(
  (w) =>
    `@font-face{font-family:"${FONT_FAMILY}";src:url("${publicUrl(`fonts/${w.file}`)}") format("opentype");font-weight:${w.weight};font-style:normal;font-display:block;}`,
).join('') + ['Outlined', 'Rounded', 'Sharp'].map(style =>
  `@font-face{font-family:"Material Symbols ${style}";src:url("${publicUrl(`fonts/material/MaterialSymbols${style}.ttf`)}") format("truetype");font-weight:100 700;font-style:normal;font-display:block;}`,
).join('')

useHead({
  style: [{ key: 'glyph-faces', textContent: fontFaceCss }],
})

setupUiSounds()
onMounted(() => {
  void load()
})

watchEffect(() => {
  if (import.meta.client) {
    document.documentElement.style.setProperty('--weight', String(weightAt(weightIndex.value).weight))
  }
})
</script>

<template>
  <div class="shell" :style="symbolStyle">
    <main
      class="layout"
      :class="{
        'layout--with-side': loaded && !drawerMode,
        'layout--no-detail': !showDetail,
      }"
    >
      <aside v-if="loaded && !drawerMode" class="side">
        <SideTools />
        <CategoryNav v-if="browseMode" />
      </aside>

      <section class="grid-wrap">
        <GridToolbar />
        <div v-if="error" class="empty error">{{ error }}</div>
        <template v-else-if="!loaded">
          <p class="status">Loading catalog…</p>
          <div class="grid grid--skeleton" aria-hidden="true">
            <div v-for="i in 24" :key="i" class="cell skeleton" :style="{ '--d': `${i * 30}ms` }" />
          </div>
        </template>
        <IconGrid v-else />
      </section>

      <DetailPanel v-if="loaded && showDetail" />
    </main>

    <CategoryDrawer />
    <AppToast />
  </div>
</template>
