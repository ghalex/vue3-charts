<template>
  <div class="chart" ref="chartEl">
    <svg
      :width="size.width"
      :height="size.height"
      :viewBox="`0 0 ${size.width} ${size.height}`"
      @pointermove="onMouseMove"
      @pointerleave="onMouseOut"
    >
      <g class="layers">
        <slot name="layers" />
      </g>
      <g class="axis">
        <axis
          v-if="!hideX"
          position="bottom"
          ref="axBottomEl"
          :rotate="rotateX"
          :isPrimary="direction === 'horizontal'"
        />
        <axis
          v-if="!hideY"
          position="left"
          ref="axLeftEl"
          :isPrimary="direction === 'vertical'"
        />
      </g>
    </svg>
    <div class="widgets">
      <slot name="widgets" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  provide,
  watch,
  reactive,
  ref,
  computed
} from 'vue'
import { ChartAxis, ChartConfig, Data, Direction, Margin, Size } from '@/types'
import { Chart } from '@/models'
import { pointer } from 'd3-selection'
import { bisectCenter } from 'd3-array'
import Axis from '../Axis/index.vue'

export default defineComponent({
  name: 'Chart',
  components: { Axis },
  props: {
    data: {
      type: Array as () => Data[],
      default: () => []
    },
    margin: {
      type: Object as () => Margin,
      default: () => ({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }),
      required: false
    },
    size: {
      type: Object as () => Size,
      default: () => ({ width: 500, height: 400 }),
      required: false
    },
    direction: {
      type: String as () => Direction,
      default: 'horizontal',
      required: false
    },
    axis: {
      type: Object as () => ChartAxis,
      required: false
    },
    config: {
      type: Object as () => Partial<ChartConfig>,
      default: () => ({})
    }
  },
  setup(props) {
    const chartEl = ref(null)
    const axLeftEl = ref<{ $el: SVGGElement }>()
    const axBottomEl = ref<{ $el: SVGGElement }>()
    const axisSpace = reactive<ChartConfig['axisSpace']>({ x: 40, y: 20 })

    const chart = new Chart(props.data, props.config)
    const rotateX = computed(() => props.axis && props.axis.primary && props.axis.primary.rotate)
    const hideX = computed(() => {
      return props.axis && props.axis.primary && props.axis.primary.hide
    })

    const hideY = computed(() => {
      return props.axis && props.axis.secondary && props.axis.secondary.hide
    })

    const mouse = reactive({
      index: -1,
      position: { x: 0, y: 0 },
      hover: false
    })

    provide('chart', chart)
    provide('chartMouse', mouse)

    // Data change
    watch(
      () => props.data,
      () => {
        if (chart) chart.changeData(props.data)
      },
      { immediate: true }
    )

    // Config change
    watch(
      () => props.config,
      () => {
        if (chart) chart.changeConfig(props.config)
      }
    )

    watch(
      () => [{ ...axisSpace }, props.direction, props.size, props.margin, props.axis],
      () => {
        if (chart) {
          chart.changeConfig({
            axisSpace: { ...axisSpace },
            direction: props.direction,
            size: props.size,
            margin: props.margin,
            axis: props.axis
          })
        }
      },
      { immediate: true }
    )

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (axBottomEl.value && entry.target === axBottomEl.value.$el) {
          axisSpace.y = entry.contentRect.height
        } else if (axLeftEl.value && entry.target === axLeftEl.value.$el) {
          axisSpace.x = entry.contentRect.width
        }
      }
    })

    onMounted(() => {
      if (axBottomEl.value) {
        resizeObserver.observe(axBottomEl.value.$el)
      }
      if (axLeftEl.value) {
        resizeObserver.observe(axLeftEl.value.$el)
      }
    })

    onUnmounted(() => {
      resizeObserver.disconnect()
    })

    function onMouseOut() {
      if (props.config.controlHover === false) {
        return
      }
      mouse.index = -1
      mouse.hover = false
    }

    function onMouseMove(e: MouseEvent) {
      if (props.config.controlHover === false) {
        return
      }
      mouse.hover = true
      mouse.position = { x: pointer(e)[0], y: pointer(e)[1] }

      const { primary } = chart.scales
      const keys = chart.getKeys(0)
      const vals = chart.getData(keys) as number[]

      if (chart.config.direction === 'horizontal') {
        if (primary.type === 'band') {
          const band = primary.bandwidth()
          const delta = mouse.position.x - chart.canvas.x
          mouse.index = Math.round((delta + band / 2) / band) - 1
        } else {
          mouse.index = bisectCenter(
            vals,
            primary.scale.invert(mouse.position.x)
          )
        }
      } else if (chart.config.direction === 'vertical') {
        if (primary.type === 'band') {
          const band = primary.bandwidth()
          const delta = mouse.position.y - chart.canvas.y
          mouse.index = Math.round((delta + band / 2) / band) - 1
        } else {
          mouse.index = bisectCenter(
            vals,
            primary.scale.invert(mouse.position.y)
          )
        }
      }
    }

    // function onTest() {
    //   if (chart) {
    //     const ticks = chart.scales.primary.ticks()
    //     console.log(ticks)
    //   }
    // }

    return { axBottomEl, axLeftEl, chartEl, hideX, hideY, rotateX, onMouseMove, onMouseOut }
  }
})
</script>

<style>
.chart {
  position: relative;
}
</style>
