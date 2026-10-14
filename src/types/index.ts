import type { Axis } from 'd3-axis'
import type { PieArcDatum } from 'd3-shape'
import type { DomainValue } from '@/utils/domain'

export type { DomainBounds, DomainValue } from '@/utils/domain'

export type Arc = PieArcDatum<number | { valueOf(): number }>

export type PieSortType = 'desc' | 'asc' | 'none' | 'custom'
export const PieSort = String as () => PieSortType

export interface Data {
  [key: string]: string | number
}

/** What series components attach to each drawn point / bar: the stacked `[y0, y1]` pair and the source row. */
export interface SeriesProps {
  values: number[]
  data: Data
}

export interface Point {
  x: number
  y: number
  props: SeriesProps
}

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
  props: SeriesProps
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

export type LayerType = 'bar' | 'line' | 'area' | 'pie' | 'points' | 'custom'

/** Provided by `<Group>` and injected by every layer under it. */
export interface LayerProps {
  stacked?: boolean
  maxWidth?: number
}

/** A series registered with the chart model: what `<Layer>` passes to `chart.addLayer`. */
export interface ChartLayer {
  id: string
  dataKeys: [string, string]
  type: LayerType
  props: LayerProps
}

/** The drawable area inside margins and axis space. `width` / `height` are sizes, not edges. */
export interface Canvas {
  x: number
  y: number
  width: number
  height: number
}

export type Domain = [DomainValue, DomainValue]
export type Direction = 'horizontal' | 'vertical' | 'circular'
export type ScaleType = 'band' | 'linear'

export interface AxisConfig {
  domain: Domain
  type: ScaleType
  format?: (_: any) => string
  ticks?: number
  tickValues?: any[]
  hide?: boolean
  rotate?: boolean
  useConfig?: (ax: Axis<any>) => void
}

export interface ChartAxis {
  primary: AxisConfig
  secondary: AxisConfig
}

/** What users pass in: every field optional, merged over the defaults. */
export interface ChartAxisOptions {
  primary?: Partial<AxisConfig>
  secondary?: Partial<AxisConfig>
}

export interface ChartConfig {
  size: Size
  margin: Margin
  direction: Direction
  axis: ChartAxis
  axisSpace: { x: number; y: number }
  controlHover?: boolean
}

export type ChartOptions = Partial<Omit<ChartConfig, 'axis'>> & { axis?: ChartAxisOptions }

/** camelCase SVG presentation attributes, e.g. `{ fill: 'red', strokeWidth: 2 }`. */
export type StyleObject = Record<string, string | number | undefined>

/** Style props accept an object or a function of the datum returning one. */
export type StyleProp<A = any> = StyleObject | ((args: A) => StyleObject)

export interface Payload {
  color: string
  label: string
  values: any
}
