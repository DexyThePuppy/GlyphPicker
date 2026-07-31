<script setup lang="ts">
const emit = defineEmits<{ pick: [id: string] }>()

const { buckets, activeCategoryId, glyphByName } = useCatalog()
const { tick } = useUiSounds()

const tabs = computed(() => [
  {
    id: 'all',
    title: 'All',
    icon: 'square.grid.2x2',
    count: buckets.value.reduce((n, b) => n + b.symbols.length, 0),
  },
  ...buckets.value.map((b) => ({
    id: b.id,
    title: b.title,
    icon: b.icon,
    count: b.symbols.length,
  })),
])

function selectTab(id: string): void {
  if (activeCategoryId.value !== id) {
    activeCategoryId.value = id
    tick()
  }
  emit('pick', id)
}
</script>

<template>
  <nav class="cat-nav" aria-label="Categories">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="cat-tab"
      :aria-selected="activeCategoryId === tab.id"
      @click="selectTab(tab.id)"
    >
      <span class="cat-tab-icon glyph">{{ (tab.icon && glyphByName.get(tab.icon)) || '•' }}</span>
      <span class="cat-tab-label">{{ tab.title }}</span>
      <span class="cat-tab-count">{{ tab.count.toLocaleString() }}</span>
    </button>
  </nav>
</template>
