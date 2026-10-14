import { ref, Ref } from 'vue'
import { Scales } from '.'
import { getCol, mergeConfig } from '@/utils'
import { stack, stackOrderNone } from 'd3-shape'
import { AxisConfig, Canvas, ChartConfig, ChartLayer, ChartOptions, Data, LayerType } from '@/types'

const defaultConfig: ChartConfig = {
  size: { width: 500, height: 400 },
  margin: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  direction: 'horizontal',
  axis: {
    primary: {
      domain: ['dataMin', 'dataMax'],
      type: 'band'
    },
    secondary: {
      domain: ['dataMin', 'dataMax'],
      type: 'linear'
    }
  },
  axisSpace: {
    x: 40,
    y: 20
  }
}

/**
 * Non-reactive chart state: data, config, registered layers and scales. Every mutation calls
 * `update()`, which recomputes the scales and bumps `updates`; drawing code watches that counter.
 */
export default class Chart {
  data: Data[]
  layers: ChartLayer[]
  config: ChartConfig
  scales: Scales
  updates: Ref<number>

  constructor(data: Data[], config: ChartOptions) {
    this.data = data
    this.layers = []
    this.config = mergeConfig(defaultConfig, config)
    this.scales = new Scales(this.config.axis)
    this.updates = ref(0)
  }

  get bandScale() {
    if (this.scales.primary.type === 'band') return this.scales.primary
    if (this.scales.secondary.type === 'band') return this.scales.secondary
    return null
  }

  /** The axis config drawn at the bottom / left of the chart for the current direction. */
  get bottomAxis(): AxisConfig {
    return this.config.direction === 'vertical' ? this.config.axis.secondary : this.config.axis.primary
  }

  get leftAxis(): AxisConfig {
    return this.config.direction === 'vertical' ? this.config.axis.primary : this.config.axis.secondary
  }

  /** The drawable area: inside the margins, minus the space reserved for visible axes. */
  get canvas(): Canvas {
    const { margin, size, axisSpace } = this.config
    const spaceX = this.leftAxis.hide ? 0 : axisSpace.x
    const spaceY = this.bottomAxis.hide ? 0 : axisSpace.y

    return {
      x: margin.left + spaceX,
      y: margin.top,
      width: size.width - margin.left - spaceX - margin.right,
      height: size.height - margin.top - margin.bottom - spaceY
    }
  }

  public getStackedData(keys: string[]) {
    return stack<Data>().keys(keys).order(stackOrderNone)(this.data)
  }

  public changeData(data: Data[]) {
    this.data = data
    this.update()
  }

  public changeConfig(config: ChartOptions) {
    this.config = mergeConfig(this.config, config)
    this.scales.changeConfig(this.config.axis)
    this.update()
  }

  public addLayer(layer: ChartLayer) {
    this.layers.push(layer)
    this.update()
  }

  public removeLayer(id: string) {
    this.layers = this.layers.filter((l) => l.id !== id)
    this.update()
  }

  public getLayers(type?: LayerType) {
    if (type) {
      return this.layers.filter((l) => l.type === type)
    }
    return this.layers
  }

  public getData(keys: string[]): (string | number)[] {
    return keys.flatMap((key) => getCol<string | number>(key, this.data))
  }

  /** `dataKeys` of every registered layer (optionally of one type); `idx` picks one column of the tuples. */
  public getKeys(): [string, string][]
  public getKeys(idx: number, type?: LayerType | null): string[]
  public getKeys(idx: number = -1, type: LayerType | null = null) {
    const keys = this.layers.filter((l) => !type || l.type === type).map((l) => l.dataKeys)
    return idx === -1 ? keys : getCol<string>(idx, keys)
  }

  public getStackedKeys(): [string, string][]
  public getStackedKeys(idx: number, type?: LayerType | null): string[]
  public getStackedKeys(idx: number = -1, type: LayerType | null = null) {
    const keys = this.layers.filter((l) => (!type || l.type === type) && l.props.stacked).map((l) => l.dataKeys)
    return idx === -1 ? keys : getCol<string>(idx, keys)
  }

  public update() {
    const stackedData = this.getStackedData(this.getStackedKeys(1))
    this.scales.updateRange(this.canvas, this.config.direction)
    this.scales.updateDomain(this.data, stackedData, this.getKeys())

    this.updates.value += 1
  }
}
