const menuOpen = ref(false)
const showDetail = ref(true)
const drawerMode = ref(false)

let mediaBound = false

function bindMedia(): void {
  if (mediaBound || !import.meta.client) return
  mediaBound = true

  const detailMq = window.matchMedia('(min-width: 1200px)')
  const drawerMq = window.matchMedia('(max-width: 900px)')

  const sync = (): void => {
    showDetail.value = detailMq.matches
    drawerMode.value = drawerMq.matches
    if (!drawerMode.value) menuOpen.value = false
  }

  sync()
  detailMq.addEventListener('change', sync)
  drawerMq.addEventListener('change', sync)
}

export function useUiLayout() {
  bindMedia()

  watch(menuOpen, (open) => {
    if (!import.meta.client) return
    document.documentElement.classList.toggle('menu-open', open)
  })

  function openMenu(): void {
    menuOpen.value = true
  }

  function closeMenu(): void {
    menuOpen.value = false
  }

  function toggleMenu(): void {
    menuOpen.value = !menuOpen.value
  }

  return {
    showDetail,
    drawerMode,
    menuOpen,
    openMenu,
    closeMenu,
    toggleMenu,
  }
}
