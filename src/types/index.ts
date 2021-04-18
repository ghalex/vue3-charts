export interface Point {
  x: number
  y: number
  props: any
}

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
  props: any
}

export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface Size {
  width: number
  height: number
}

export interface Data {
  [key: string]: string | number
}

export type LayerType = 'bar' | 'line' | 'area' | 'points' | 'custom'

export interface Layer {
  id: string
  dataKeys: [string, string]
  type: LayerType
  props: any
}

export interface Canvas {
  x: number
  y: number
  width: number
  height: number
}

export type Domain = [string | number, string | number]
export type Direction = 'horizontal' | 'vertical'
export type ScaleType = 'band' | 'linear'

export interface AxisConfig {
  domain: Domain
  type: ScaleType
  format?: (val: string) => string
  ticks?: number
  tickValues?: any[]
}

export interface ChartAxis {
  primary: AxisConfig
  secondary: AxisConfig
}

export interface ChartConfig {
  size: Size
  margin: Margin
  direction: Direction
  axis: ChartAxis
}

export interface Payload {
  color: string
  label: string
  values: any
}
