import { scaleBand, scaleLinear } from 'd3-scale'
import { inject, ref } from 'vue'

export default () => {
  const xScale = inject('xScale', ref(scaleBand()))
  const yScale = inject('yScale', ref(scaleLinear()))

  return { xScale, yScale }
}
