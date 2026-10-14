import { AxisConfig, Data, ScaleType } from '@/types'
import { evaluateDomain, getCol } from '@/utils'
import { extent, max, min } from 'd3-array'
import { ScaleBand, ScaleLinear, scaleBand, scaleLinear } from 'd3-scale'
import { Series } from 'd3-shape'

export type BandScale = ScaleBand<string | number>
export type LinearScale = ScaleLinear<number, number>

export default class Scale {
  scale: BandScale | LinearScale
  config: AxisConfig

  constructor(config: AxisConfig) {
    this.config = config
    this.scale = Scale.create(config.type)
  }

  private static create(type: ScaleType): BandScale | LinearScale {
    return type === 'band' ? scaleBand<string | number>() : scaleLinear<number, number>()
  }

  public changeConfig(config: AxisConfig) {
    this.scale = Scale.create(config.type)
    this.config = config
  }

  public get type() {
    return this.config.type
  }

  public get band(): BandScale | null {
    return this.config.type === 'band' ? (this.scale as BandScale) : null
  }

  public get linear(): LinearScale | null {
    return this.config.type === 'linear' ? (this.scale as LinearScale) : null
  }

  public bandwidth() {
    return this.band?.bandwidth() ?? 0
  }

  public domain(): (string | number)[] {
    return this.scale.domain()
  }

  public range(): number[] {
    return this.scale.range()
  }

  public updateRange(range: [number, number]) {
    this.scale = this.band ? this.band.copy().range(range) : (this.scale as LinearScale).copy().range(range)
  }

  public updateDomain(data: Data[], stackedData: Series<any, string>[], keys: string[]) {
    if (this.band) {
      this.scale = this.band.copy().domain(this.categoryDomain(data, keys))
    } else if (this.linear) {
      this.scale = this.linear.copy().domain(this.numericDomain(data, stackedData, keys))
    }
  }

  /** Raw scale position: the start of the band, or the linear position. `NaN` for values outside a band domain. */
  public at(value: string | number): number {
    if (this.band) return this.band(value) ?? NaN
    return (this.scale as LinearScale)(Number(value))
  }

  /** Position used for drawing: the centre of the band, or the linear position. */
  public mapOne(value: string | number): number {
    return this.band ? this.at(value) + this.bandwidth() / 2 : this.at(value)
  }

  public map(values: (string | number)[]): number[] {
    return values.map((v) => this.mapOne(v))
  }

  /** Data value at a pixel position. Only linear scales can be inverted; bands return `NaN`. */
  public invert(px: number): number {
    return this.linear ? this.linear.invert(px) : NaN
  }

  public ticks(): (string | number)[] {
    if (this.config.tickValues !== undefined) {
      return this.config.tickValues
    }
    if (this.band) {
      return this.band.domain()
    }
    return (this.scale as LinearScale).ticks(this.config.ticks ?? 5)
  }

  private categoryDomain(data: Data[], keys: string[]) {
    const values = keys.flatMap((key) => getCol<string | number>(key, data))
    return Array.from(new Set(values))
  }

  private numericDomain(data: Data[], stackedData: Series<any, string>[], keys: string[]): [number, number] {
    const values = keys.flatMap((key) => getCol<number>(key, data))
    const stackedMax = max(stackedData, (arr) => max(arr, (x) => max(x))) ?? 0
    const stackedMin = min(stackedData, (arr) => min(arr, (x) => min(x))) ?? 0
    const [dataMin = 0, dataMax = 0] = extent(values.concat([stackedMin, stackedMax]))
    const bounds = { dataMin, dataMax }

    return [evaluateDomain(this.config.domain[0], bounds), evaluateDomain(this.config.domain[1], bounds)]
  }
}
