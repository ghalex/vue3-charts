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
        <axis v-if="!hideY" position="left" ref="axLeftEl" :isPrimary="direction === 'vertical'" />
      </g>
    </svg>
    <div class="widgets">
      <slot name="widgets" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, provide, watch, reactive, ref, computed } from 'vue'
import { ChartAxisOptions, ChartConfig, ChartOptions, Data, Direction, Margin, Size } from '@/types'
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
      type: Object as () => ChartAxisOptions,
      required: false
    },
    config: {
      type: Object as () => ChartOptions,
      default: () => ({})
    }
  },
  setup(props) {
    const chartEl = ref<HTMLDivElement | null>(null)
    const axLeftEl = ref<{ $el: SVGGElement }>()
    const axBottomEl = ref<{ $el: SVGGElement }>()
    const axisSpace = reactive<ChartConfig['axisSpace']>({ x: 40, y: 20 })

    const chart = new Chart(props.data, props.config)
    // The primary axis is drawn at the bottom for horizontal (and circular) charts and at the left for vertical ones.
    const bottomAxis = computed(() => (props.direction === 'vertical' ? props.axis?.secondary : props.axis?.primary))
    const leftAxis = computed(() => (props.direction === 'vertical' ? props.axis?.primary : props.axis?.secondary))
    const rotateX = computed(() => bottomAxis.value?.rotate ?? false)
    const hideX = computed(() => bottomAxis.value?.hide ?? false)
    const hideY = computed(() => leftAxis.value?.hide ?? false)

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
      () => chart.changeData(props.data),
      { immediate: true }
    )

    // Config change
    watch(
      () => props.config,
      () => chart.changeConfig(props.config)
    )

    watch(
      () => [{ ...axisSpace }, props.direction, props.size, props.margin, props.axis],
      () => {
        chart.changeConfig({
          axisSpace: { ...axisSpace },
          direction: props.direction,
          size: props.size,
          margin: props.margin,
          axis: props.axis
        })
      },
      { immediate: true }
    )

    // The observer is created in onMounted, not here: setup() also runs on the server (Nuxt SSR), where
    // ResizeObserver does not exist.
    let resizeObserver: ResizeObserver | null = null
    let resizeFrame: number | null = null
    const measured: ChartConfig['axisSpace'] = { ...axisSpace }

    function applyAxisSpace() {
      resizeFrame = null
      axisSpace.x = measured.x
      axisSpace.y = measured.y
    }

    onMounted(() => {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (axBottomEl.value && entry.target === axBottomEl.value.$el) {
            measured.y = entry.contentRect.height
          } else if (axLeftEl.value && entry.target === axLeftEl.value.$el) {
            measured.x = entry.contentRect.width
          }
        }
        // Writing axisSpace re-renders the axes being observed. Doing that from inside the callback resizes an
        // observed element in the same frame, which browsers report as "ResizeObserver loop limit exceeded"
        // (and Nuxt's dev overlay shows as a fatal error). Apply the measurement on the next frame instead.
        if (resizeFrame === null) {
          resizeFrame = requestAnimationFrame(applyAxisSpace)
        }
      })
      if (axBottomEl.value) {
        resizeObserver.observe(axBottomEl.value.$el)
      }
      if (axLeftEl.value) {
        resizeObserver.observe(axLeftEl.value.$el)
      }
    })

    onUnmounted(() => {
      if (resizeFrame !== null) {
        cancelAnimationFrame(resizeFrame)
      }
      resizeObserver?.disconnect()
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
      const vals = chart.getData(chart.getKeys(0)) as number[]

      if (chart.config.direction === 'horizontal') {
        if (primary.type === 'band') {
          const band = primary.bandwidth()
          const delta = mouse.position.x - chart.canvas.x
          mouse.index = Math.round((delta + band / 2) / band) - 1
        } else {
          mouse.index = bisectCenter(vals, primary.invert(mouse.position.x))
        }
      } else if (chart.config.direction === 'vertical') {
        if (primary.type === 'band') {
          const band = primary.bandwidth()
          const delta = mouse.position.y - chart.canvas.y
          mouse.index = Math.round((delta + band / 2) / band) - 1
        } else {
          mouse.index = bisectCenter(vals, primary.invert(mouse.position.y))
        }
      }
    }

    return { axBottomEl, axLeftEl, chartEl, hideX, hideY, rotateX, onMouseMove, onMouseOut }
  }
})
</script>

<style>
.chart {
  position: relative;
}
</style>
