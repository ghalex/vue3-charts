import { BarsReturn } from './src/hooks/useBars'
import { MouseReturn } from './src/hooks/useMouse'
import { PointsReturn } from './src/hooks/usePoints'
import { ResizeReturn } from './src/hooks/useResize'
import { Chart as ChartModel } from './src/models'

import { DefineComponent, Plugin, Ref } from 'vue'

declare const Lib: Exclude<Plugin['install'], undefined>
export default Lib

export const Bar: DefineComponent<{}, {}, any>
export const Chart: DefineComponent<{}, {}, any>
export const Grid: DefineComponent<{}, {}, any>
export const Layer: DefineComponent<{}, {}, any>
export const Line: DefineComponent<{}, {}, any>
export const Responsive: DefineComponent<{}, {}, any>
export const Tooltip: DefineComponent<{}, {}, any>

declare const useChart: () => ChartModel
declare const usePoints: () => PointsReturn
declare const useBars: () => BarsReturn
declare const useResize: (el: Ref) => ResizeReturn
declare const useMouse: (el: Ref) => MouseReturn

export { useResize, useChart, usePoints, useBars }
export * from './src/types'
