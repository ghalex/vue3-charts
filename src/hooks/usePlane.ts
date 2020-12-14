import { Canvas } from '@/types'
import { inject, ref, Ref } from 'vue'

interface Return {
  chart: any
  data: Ref<any[]>
  canvas: Ref<Canvas>
  mousePos: Ref<{ x: number; y: number }>
  mouseIdx: Ref<{ x: number; y: number }>
  isMouseOver: Ref<boolean>
}

export default (): Return => {
  const chart = inject('chart', ref(null))
  const data = inject('data', ref<any[]>([]))
  const mousePos = inject('mousePos', ref({ x: 0, y: 0 }))
  const mouseIdx = inject('mouseIdx', ref({ x: 0, y: 0 }))
  const isMouseOver = inject('isMouseOver', ref(false))
  const canvas = inject('canvas', ref({ x: 0, y: 0, width: 600, height: 300 }))

  return { chart, data, mousePos, isMouseOver, mouseIdx, canvas }
}
