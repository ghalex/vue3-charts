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
    const right = canvas.x + canvas.width
    const bottom = canvas.y + canvas.height

    if (direction === 'horizontal') {
      this.primary.updateRange([canvas.x, right])
      this.secondary.updateRange([bottom, canvas.y])
    } else if (direction === 'vertical') {
      this.primary.updateRange([canvas.y, bottom])
      this.secondary.updateRange([canvas.x, right])
    }
  }

  public updateDomain(data: Data[], stackedData: Series<any, string>[], keys: Array<[string, string]>) {
    this.primary.updateDomain(data, stackedData, getCol(0, keys))
    this.secondary.updateDomain(data, stackedData, getCol(1, keys))
  }
}
