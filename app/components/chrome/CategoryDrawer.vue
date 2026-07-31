<script setup lang="ts">
const { loaded, browseMode, glyphByName } = useCatalog()
const { drawerMode, menuOpen, closeMenu } = useUiLayout()

function glyph(name: string, fallback = '•'): string {
  return glyphByName.value.get(name) || fallback
}

onKeyStroke('Escape', () => {
  if (menuOpen.value) closeMenu()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="loaded && drawerMode" class="drawer-root">
      <Transition name="fade">
        <button
          v-if="menuOpen"
          type="button"
          class="drawer-backdrop"
          aria-label="Close menu"
          @click="closeMenu"
        />
      </Transition>

      <aside
        class="drawer"
        :class="{ 'drawer--open': menuOpen }"
        :aria-hidden="!menuOpen"
        :inert="!menuOpen"
        aria-label="Menu"
      >
        <header class="drawer-head">
          <span class="drawer-title">Menu</span>
          <button type="button" class="icon-btn" title="Close" @click="closeMenu">
            <span class="glyph">{{ glyph('xmark') }}</span>
          </button>
        </header>
        <div class="drawer-tools">
          <SideTools />
        </div>
        <CategoryNav v-if="browseMode" class="drawer-nav" @pick="closeMenu" />
        <div class="drawer-foot">
          <WeightControl />
        </div>
      </aside>
    </div>
  </Teleport>
</template>
