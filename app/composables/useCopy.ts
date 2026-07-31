export function useCopy() {
  const { show } = useToast()
  const { pop } = useUiSounds()

  async function copyValue(label: string, value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value)
      show(`Copied ${label}`)
      pop()
    } catch {
      show('Clipboard unavailable')
    }
  }

  return { copyValue }
}
