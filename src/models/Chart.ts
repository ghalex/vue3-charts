import * as r from 'ramda'
import { ref, Ref } from 'vue'
import { Scales } from '.'
import { getCol } from '@/utils'
import { stack, stackOrderNone } from 'd3-shape'
import { AxisConfig, Canvas, ChartConfig, ChartOptions, Data, Layer, LayerType } from '@/types'

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

export default class Chart {
  data: Data[]
  layers: Layer[]
  config: ChartConfig
  scales: Scales
  updates: Ref<number>

  constructor(data: Data[], config: ChartOptions) {
    this.data = data
    this.layers = []
    this.config = r.mergeDeepLeft(
      r.pickBy((p) => p !== undefined, config) as ChartOptions,
      defaultConfig
    ) as ChartConfig
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

  get canvas(): Canvas {
    const { margin, size, axisSpace } = this.config
    const spaceX = this.leftAxis.hide ? 0 : axisSpace.x
    const spaceY = this.bottomAxis.hide ? 0 : axisSpace.y

    return {
      x: margin.left + spaceX,
      y: margin.top,
      width: size.width - margin.right,
      height: size.height - margin.bottom - spaceY
    }
  }

  public getStackedData(keys: string[]) {
    return stack().keys(keys).order(stackOrderNone)(this.data as any)
  }

  public changeData(data: Data[]) {
    this.data = data
    this.update('data')
  }

  public changeConfig(config: ChartOptions) {
    this.config = r.mergeDeepLeft(r.pickBy((p) => p !== undefined, config) as ChartOptions, this.config) as ChartConfig
    this.scales.changeConfig(this.config.axis)

    this.update('config')
  }

  public addLayer(layer: Layer) {
    this.layers.push(layer)
    this.update('layers')
  }

  public removeLayer(id: string) {
    this.layers = this.layers.filter((l) => l.id !== id)
    this.update('layers')
  }

  public getLayers(type?: LayerType) {
    if (type) {
      return this.layers.filter((l) => l.type === type)
    }
    return this.layers
  }

  public getData(keys: string[]): number[] {
    return keys.reduce((arr, key) => arr.concat(getCol(key, this.data)), [])
  }

  public getKeys(idx: number = -1, type: string | null = null) {
    const keys = this.layers
      .filter((l) => {
        if (type) return l.type === type
        return true
      })
      .map((l) => l.dataKeys)

    if (idx === -1) {
      return keys
    }

    return getCol(idx, keys)
  }

  public getStackedKeys(idx: number = -1, type: string | null = null) {
    const keys = this.layers
      .filter((l) => {
        if (type) return l.type === type && l.props.stacked
        return l.props.stacked
      })
      .map((l) => l.dataKeys)

    if (idx === -1) {
      return keys
    }

    return getCol(idx, keys)
  }

  public update(_: string) {
    const stackedData = this.getStackedData(this.getStackedKeys(1))
    this.scales.updateRange(this.canvas, this.config.direction)
    this.scales.updateDomain(this.data, stackedData, this.getKeys())

    this.updates.value += 1
  }
}
