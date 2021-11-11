import { Canvas, ChartAxis, Data, Direction } from '@/types'
import { getCol } from '@/utils'
import { Series } from 'd3-shape'
import Scale from './Scale'

export default class Scales {
  primary: Scale
  secondary: Scale
  config: ChartAxis

  constructor(config: ChartAxis) {
    this.config = config
    this.primary = new Scale(config.primary)
    this.secondary = new Scale(config.secondary)
  }

  public changeConfig(config: ChartAxis) {
    this.config = config
    this.primary.changeConfig(config.primary)
    this.secondary.changeConfig(config.secondary)
  }

  public updateRange(canvas: Canvas, direction: Direction) {
    if (direction === 'horizontal') {
      this.primary.updateRange([canvas.x, canvas.width])
      this.secondary.updateRange([canvas.height, canvas.y])
    } else if (direction === 'vertical') {
      this.primary.updateRange([canvas.y, canvas.height])
      this.secondary.updateRange([canvas.x, canvas.width])
    }
  }

  public updateDomain(data: Data[], stackedData: Series<any, string>[], keys: Array<[string, string]>) {
    this.primary.updateDomain(data, stackedData, getCol(0, keys))
    this.secondary.updateDomain(data, stackedData, getCol(1, keys))
  }
}
