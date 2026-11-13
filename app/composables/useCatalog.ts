import { categorizeSymbols, type CategoryBucket, type CategoryMapFile } from '~/utils/categories'
import { publicUrl } from '~/utils/publicUrl'
import { searchSymbols, type NamingsFile } from '~/utils/search'
import type { SymbolCatalog, SymbolEntry } from '~/utils/types'

const glyphCatalog = shallowRef<SymbolCatalog | null>(null)
const materialCatalogs = shallowRef<Record<string, SymbolCatalog>>({})
const collection = useLocalStorage('gb:collection', 'glyph')
const materialStyle = useLocalStorage('gb:material-style', 'rounded')
const materialWeight = useLocalStorage('gb:material-weight', 400)
const materialFill = useLocalStorage('gb:material-fill', 0)
const materialGrade = useLocalStorage('gb:material-grade', 0)
const materialOpticalSize = useLocalStorage('gb:material-opsz', 24)
const isMaterial = computed(() => collection.value === 'material')
const catalog = computed(() => isMaterial.value
  ? materialCatalogs.value[materialStyle.value] ?? null : glyphCatalog.value)
const synonyms = shallowRef<Record<string, string[]>>({})
const categoryMap = shallowRef<CategoryMapFile | null>(null)
const materialCategoryMap = shallowRef<CategoryMapFile | null>(null)

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
  const map = isMaterial.value ? materialCategoryMap.value : categoryMap.value
  if (!browseMode.value || !map) return []
  return categorizeSymbols(filtered.value, map)
})

const visibleSymbols = computed<SymbolEntry[]>(() => {
  if (!browseMode.value) return filtered.value
  if (activeCategoryId.value === 'all') return buckets.value.flatMap((b) => b.symbols)
  return buckets.value.find((b) => b.id === activeCategoryId.value)?.symbols ?? []
})

const glyphByName = computed(() => {
  const map = new Map<string, string>()
  if (glyphCatalog.value) for (const s of glyphCatalog.value.symbols) map.set(s.name, s.char)
  return map
})

const activeCategoryTitle = computed(() => {
  if (activeCategoryId.value === 'all') return 'All'
  return buckets.value.find((b) => b.id === activeCategoryId.value)?.title ?? 'Category'
})

// Keep selection valid whenever the visible list changes.
watch(visibleSymbols, (list) => {
  selected.value = list.find((s) => s.name === selected.value?.name) ?? list[0] ?? null
})

watch(collection, () => { activeCategoryId.value = 'all' })

// Fall back to "All" if the active category disappears (e.g. filter change).
watch(buckets, (list) => {
  if (activeCategoryId.value !== 'all' && !list.some((b) => b.id === activeCategoryId.value)) {
    activeCategoryId.value = 'all'
  }
})

async function load(): Promise<void> {
  if (loaded.value) return
  try {
    const [symRes, nameRes, catRes, materialRes, materialCatRes] = await Promise.all([
      fetch(publicUrl('symbols.json')),
      fetch(publicUrl('namings.json')),
      fetch(publicUrl('categories.json')),
      fetch(publicUrl('material-symbols.json')),
      fetch(publicUrl('material-categories.json')),
    ])
    for (const [res, file] of [
      [symRes, 'symbols.json'],
      [nameRes, 'namings.json'],
      [catRes, 'categories.json'],
      [materialRes, 'material-symbols.json'],
      [materialCatRes, 'material-categories.json'],
    ] as const) {
      if (!res.ok) throw new Error(`Failed to load ${file} (${res.status})`)
    }
    glyphCatalog.value = (await symRes.json()) as SymbolCatalog
    materialCatalogs.value = await materialRes.json()
    materialCategoryMap.value = (await materialCatRes.json()) as CategoryMapFile
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
    collection, materialStyle, materialWeight, materialFill, materialGrade,
    materialOpticalSize, isMaterial, catalog,
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
