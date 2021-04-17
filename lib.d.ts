import { BarsReturn } from './src/hooks/useBars'
import { MouseReturn } from './src/hooks/useMouse'
import { PointsReturn } from './src/hooks/usePoints'
import { ResizeReturn } from './src/hooks/useResize'
import { Chart as ChartModel } from './src/models'

import { DefineComponent, Plugin, Ref } from 'vue'

declare const Lib: Exclude<Plugin['install'], undefined>
export default Lib

export const Area: DefineComponent<{}, {}, any>
export const Bar: DefineComponent<{}, {}, any>
export const Chart: DefineComponent<{}, {}, any>
export const Grid: DefineComponent<{}, {}, any>
export const Group: DefineComponent<{}, {}, any>
export const Layer: DefineComponent<{}, {}, any>
export const Line: DefineComponent<{}, {}, any>
export const Responsive: DefineComponent<{}, {}, any>
export const Marker: DefineComponent<{}, {}, any>
export const Tooltip: DefineComponent<{}, {}, any>

declare const useBars: () => BarsReturn
declare const useChart: () => ChartModel
declare const useMouse: (el: Ref) => MouseReturn
declare const usePoints: () => PointsReturn
declare const useResize: (el: Ref) => ResizeReturn

export { useResize, useChart, usePoints, useBars, useMouse }
export * from './src/types'
