import { onMounted, onUnmounted, ref, Ref } from 'vue'

export interface ResizeReturn {
  width: Ref<number>
  height: Ref<number>
  onResize: (fn: () => void) => void
}

export default (el: Ref): ResizeReturn => {
  const width = ref(0)
  const height = ref(0)

  let observer: any = null
  let resizeCallback: any = null

  function onUpdate(w: number, h: number) {
    width.value = w
    height.value = h

    if (resizeCallback) {
      resizeCallback()
    }
  }

  function onResize(callback: () => void) {
    resizeCallback = callback
  }

  onMounted(() => {
    observer = new (window as any).ResizeObserver((entries: any) => {
      const w = entries[0].contentRect.width
      const h = entries[0].contentRect.height

      onUpdate(w, h)
    })

    observer.observe(el.value)
  })

  onUnmounted(() => {
    observer.disconnect()
  })

  return { width, height, onResize }
}
