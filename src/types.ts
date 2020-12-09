import { ScaleBand, ScaleLinear } from 'd3-scale'

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
