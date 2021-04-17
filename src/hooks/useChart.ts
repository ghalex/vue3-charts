import { Chart } from '@/models'
import { inject } from 'vue'

export default (): Chart => {
  const chart = inject('chart') as Chart
  return chart
}
