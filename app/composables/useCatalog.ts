import { categorizeSymbols, type CategoryBucket, type CategoryMapFile } from '~/utils/categories'
import { searchSymbols, type NamingsFile } from '~/utils/search'
import type { SymbolCatalog, SymbolEntry } from '~/utils/types'

const catalog = shallowRef<SymbolCatalog | null>(null)
const synonyms = shallowRef<Record<string, string[]>>({})
const categoryMap = shallowRef<CategoryMapFile | null>(null)

const query = ref('')
const debouncedQuery = refDebounced(query, 140)
const showNames = useLocalStorage('gb:show-names', true)
const weightIndex = useLocalStorage('gb:weight', 3)
const activeCategoryId = ref('all')
const selected = shallowRef<SymbolEntry | null>(null)

const loaded = ref(false)
const error = ref<string | null>(null)

const browseMode = computed(() => debouncedQuery.value.trim().length === 0)

const filtered = computed<SymbolEntry[]>(() => {
  if (!catalog.value) return []
  return searchSymbols(
    catalog.value.symbols,
    debouncedQuery.value,
    synonyms.value,
    true,
  ).map((r) => r.symbol)
})

const buckets = computed<CategoryBucket[]>(() => {
  if (!browseMode.value || !categoryMap.value) return []
  return categorizeSymbols(filtered.value, categoryMap.value)
})

const visibleSymbols = computed<SymbolEntry[]>(() => {
  if (!browseMode.value) return filtered.value
  if (activeCategoryId.value === 'all') return buckets.value.flatMap((b) => b.symbols)
  return buckets.value.find((b) => b.id === activeCategoryId.value)?.symbols ?? []
})

const glyphByName = computed(() => {
  const map = new Map<string, string>()
  if (catalog.value) for (const s of catalog.value.symbols) map.set(s.name, s.char)
  return map
})

const activeCategoryTitle = computed(() => {
  if (activeCategoryId.value === 'all') return 'All'
  return buckets.value.find((b) => b.id === activeCategoryId.value)?.title ?? 'Category'
})

// Keep selection valid whenever the visible list changes.
watch(visibleSymbols, (list) => {
  if (selected.value && list.some((s) => s.code === selected.value!.code)) return
  selected.value = list[0] ?? null
})

// Fall back to "All" if the active category disappears (e.g. filter change).
watch(buckets, (list) => {
  if (activeCategoryId.value !== 'all' && !list.some((b) => b.id === activeCategoryId.value)) {
    activeCategoryId.value = 'all'
  }
})

async function load(): Promise<void> {
  if (loaded.value) return
  try {
    const [symRes, nameRes, catRes] = await Promise.all([
      fetch('/symbols.json'),
      fetch('/namings.json'),
      fetch('/categories.json'),
    ])
    for (const [res, file] of [
      [symRes, 'symbols.json'],
      [nameRes, 'namings.json'],
      [catRes, 'categories.json'],
    ] as const) {
      if (!res.ok) throw new Error(`Failed to load ${file} (${res.status})`)
    }
    catalog.value = (await symRes.json()) as SymbolCatalog
    synonyms.value = ((await nameRes.json()) as NamingsFile).synonyms ?? {}
    categoryMap.value = (await catRes.json()) as CategoryMapFile
    loaded.value = true
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load catalog'
    console.error(err)
  }
}

export function useCatalog() {
  return {
    load,
    loaded,
    error,
    query,
    debouncedQuery,
    showNames,
    weightIndex,
    browseMode,
    filtered,
    buckets,
    visibleSymbols,
    activeCategoryId,
    activeCategoryTitle,
    selected,
    glyphByName,
    synonyms,
  }
}
