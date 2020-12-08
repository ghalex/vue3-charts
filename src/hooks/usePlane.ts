import { Plane } from '@/types'
import { inject, ref, Ref } from 'vue'

const emptyPlane: Plane = {
  data: [],
  canvas: { x: 0, y: 0, width: 600, height: 300 }
}

interface Return {
  plane: Ref<Plane>
}

export default (): Return => {
  const plane = inject<Ref<Plane>>('plane', ref(emptyPlane))
  return { plane }
}
