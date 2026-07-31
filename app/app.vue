<script setup lang="ts">
import { weightAt } from '~/utils/weights'

const { load, loaded, error, browseMode, weightIndex } = useCatalog()
const { showDetail, drawerMode } = useUiLayout()

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
  <div class="shell">
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
