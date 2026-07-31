import { useSound } from '@vueuse/sound'

type SfxName = 'pop' | 'tick' | 'toggle'

const soundOn = useLocalStorage('gb:sound', true)
const players: Partial<Record<SfxName, () => void>> = {}

/**
 * Creates the Howl instances exactly once (call from app.vue setup).
 * Every other component grabs the shared players via useUiSounds().
 */
export function setupUiSounds(): void {
  const pop = useSound('/sounds/pop.wav', { volume: 0.45, interrupt: true })
  const tick = useSound('/sounds/tick.wav', { volume: 0.3, interrupt: true })
  const toggle = useSound('/sounds/toggle.wav', { volume: 0.4, interrupt: true })
  players.pop = () => pop.play()
  players.tick = () => tick.play()
  players.toggle = () => toggle.play()
}

export function useUiSounds() {
  const guarded = (name: SfxName) => () => {
    if (soundOn.value) players[name]?.()
  }
  return {
    soundOn,
    pop: guarded('pop'),
    tick: guarded('tick'),
    toggle: guarded('toggle'),
  }
}
