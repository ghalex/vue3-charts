import { Layer } from '@/types'

export const isDataLayer = (layer: Layer): boolean => {
  if (layer.type === 'axis') {
    return false
  }

  return true
}
