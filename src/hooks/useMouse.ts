import { inject } from 'vue'

export interface MouseReturn {
  index: number
  position: { x: number; y: number }
  hover: boolean
}

export default (): MouseReturn => {
  const mouse = inject('chartMouse', {
    index: -1,
    position: { x: 0, y: 0 },
    hover: false
  })
  return mouse
}
