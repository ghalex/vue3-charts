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

export interface Layer {
  id: string
  type: 'bar' | 'line'
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
  xScale: ScaleBand<string>
  yScale: ScaleLinear<number, number>
  canvas: Canvas
  addLayer: (layer: Layer) => void
}
