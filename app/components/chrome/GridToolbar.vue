<script setup lang="ts">
const { query, glyphByName } = useCatalog()
const { drawerMode, menuOpen, toggleMenu } = useUiLayout()
const { tick } = useUiSounds()

const searchEl = ref<HTMLInputElement | null>(null)

function glyph(name: string, fallback = '•'): string {
  return glyphByName.value.get(name) || fallback
}

function clearSearch(): void {
  query.value = ''
  tick()
  searchEl.value?.focus()
}

onKeyStroke('/', (e) => {
  if (document.activeElement === searchEl.value) return
  const tag = (document.activeElement as HTMLElement | null)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  e.preventDefault()
  searchEl.value?.focus()
})

onKeyStroke('Escape', () => {
  if (menuOpen.value) return
  if (document.activeElement === searchEl.value) {
    query.value = ''
    searchEl.value?.blur()
  }
})

onMounted(() => searchEl.value?.focus())
</script>

<template>
  <div class="grid-toolbar" :class="{ 'grid-toolbar--drawer': drawerMode }">
    <button
      v-if="drawerMode"
      type="button"
      class="icon-btn menu-btn"
      :aria-pressed="menuOpen"
      title="Menu"
      aria-label="Open menu"
      @click="toggleMenu"
    >
      <span class="glyph">{{ glyph('sidebar.left') }}</span>
    </button>

    <div class="search-wrap">
      <span class="search-icon glyph" aria-hidden="true">{{ glyph('magnifyingglass') }}</span>
      <input
        id="search"
        ref="searchEl"
        v-model="query"
        class="search"
        type="search"
        placeholder="Search…"
        autocomplete="off"
        spellcheck="false"
        aria-label="Search"
      />
      <kbd v-if="!query" class="search-hint">/</kbd>
      <button
        v-else
        type="button"
        class="search-clear"
        aria-label="Clear search"
        @click="clearSearch"
      >
        <span class="glyph">{{ glyph('xmark.circle.fill') }}</span>
      </button>
    </div>

    <WeightControl v-if="!drawerMode" />
  </div>
</template>
