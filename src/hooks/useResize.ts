import { onMounted, onUnmounted, ref, Ref } from 'vue'

export interface ResizeReturn {
  width: Ref<number>
  height: Ref<number>
  onResize: (fn: () => void) => void
}

export default (el: Ref<Element | null | undefined>): ResizeReturn => {
  const width = ref(0)
  const height = ref(0)

  let observer: ResizeObserver | null = null
  let resizeCallback: (() => void) | null = null

  function onResize(callback: () => void) {
    resizeCallback = callback
  }

  onMounted(() => {
    if (!el.value) return

    observer = new ResizeObserver((entries) => {
      const { width: w, height: h } = entries[0].contentRect
      width.value = w
      height.value = h
      resizeCallback?.()
    })

    observer.observe(el.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { width, height, onResize }
}
