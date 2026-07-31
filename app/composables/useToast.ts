const message = ref('')
const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

export function useToast() {
  function show(msg: string): void {
    message.value = msg
    visible.value = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      visible.value = false
    }, 1400)
  }

  return { message, visible, show }
}
