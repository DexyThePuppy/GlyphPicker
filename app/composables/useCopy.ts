function supportsType(type: string): boolean {
  return typeof ClipboardItem !== 'undefined'
    && (typeof ClipboardItem.supports !== 'function' || ClipboardItem.supports(type))
}

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

  /**
   * Copies SVG markup as both plain text (Figma, Illustrator, code editors) and `image/svg+xml`
   * where the browser supports it. The markup is passed to ClipboardItem as a promise so the
   * write still counts as part of the click even if building the SVG takes a moment.
   */
  async function copySvg(label: string, svg: Promise<string>): Promise<void> {
    const asBlob = (type: string) => svg.then((text) => new Blob([text], { type }))
    try {
      if (!supportsType('text/plain')) throw new Error('ClipboardItem unsupported')
      const items: Record<string, Promise<Blob>> = { 'text/plain': asBlob('text/plain') }
      if (typeof ClipboardItem.supports === 'function' && ClipboardItem.supports('image/svg+xml')) {
        items['image/svg+xml'] = asBlob('image/svg+xml')
      }
      await navigator.clipboard.write([new ClipboardItem(items)])
    } catch (err) {
      // SVG generation itself failed: report that rather than retrying the clipboard.
      const reason = await svg.then(() => null, (e: unknown) => e)
      if (reason) {
        show(reason instanceof Error ? `SVG failed: ${reason.message}` : 'SVG failed')
        return
      }
      try {
        await navigator.clipboard.writeText(await svg)
      } catch {
        console.error(err)
        show('Clipboard unavailable')
        return
      }
    }
    show(`Copied ${label}`)
    pop()
  }

  /** Copies a PNG image. The blob is passed as a promise for the same reason as in copySvg. */
  async function copyPng(label: string, png: Promise<Blob>): Promise<void> {
    try {
      if (!supportsType('image/png')) throw new Error('Image clipboard unsupported')
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })])
    } catch (err) {
      const reason = await png.then(() => null, (e: unknown) => e)
      console.error(reason ?? err)
      show(reason instanceof Error ? `PNG failed: ${reason.message}` : 'Image clipboard unavailable')
      return
    }
    show(`Copied ${label}`)
    pop()
  }

  return { copyValue, copySvg, copyPng }
}
