import { scaleBand, scaleLinear } from 'd3-scale'
import { inject, ref, watch } from 'vue'

const defaultScales = {
  xScale: ref(scaleBand()),
  yScale: ref(scaleLinear())
}

export default (): any => {
  const xScale = inject('xScale', defaultScales.xScale)
  const yScale = inject('yScale', defaultScales.yScale)

  // watch(xScale, () => {
  //   console.log('scale change')
  // })

  return { xScale, yScale }
}
