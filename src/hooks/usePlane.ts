import { Canvas } from '@/types'
import { inject, ref, Ref } from 'vue'

interface Return {
  data: Ref<any[]>
  canvas: Ref<Canvas>
}

export default (): Return => {
  const data = inject('data', ref<any[]>([]))
  const canvas = inject('canvas', ref({ x: 0, y: 0, width: 600, height: 300 }))

  return { data, canvas }
}
