export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface Point {
  x: number
  y: number
}

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

export type LayerType = 'bar' | 'line' | 'area'

export interface Layer {
  type: LayerType
  dataKey: string
  props: any
}

export interface Canvas {
  x: number
  y: number
  width: number
  height: number
}

export interface Plane {
  data: any[]
  canvas: Canvas
}
