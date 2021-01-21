import { ScaleBand, scaleBand, ScaleLinear, scaleLinear } from 'd3-scale'
import { inject, Ref, ref } from 'vue'

interface Return {
  xScale: Ref<ScaleBand<string>>
  yScale: Ref<ScaleLinear<number, number>>
}

export default (): Return => {
  const xScale = inject('xScale', ref(scaleBand()))
  const yScale = inject('yScale', ref(scaleLinear()))

  return { xScale, yScale }
}
