<template>
  <div class="chart" ref="chartEl">
    <svg
      :width="size.width"
      :height="size.height"
      :viewBox="`0 0 ${size.width} ${size.height}`"
      @mousemove="onMouseMove"
      @mouseleave="onMouseOut"
    >
      <g class="layers">
        <slot name="layers" />
      </g>
      <g class="axis">
        <axis position="bottom" :isPrimary="direction === 'horizontal'" />
        <axis position="left" :isPrimary="direction === 'vertical'" />
      </g>
    </svg>
    <div class="widgets">
      <slot name="widgets" />
    </div>
    <!-- <div class="zb-chart-toolbar">
      <button @click="onTest">Test</button>
    </div> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, provide, watch, reactive, ref } from 'vue'
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
      type: Object as () => Data[],
      default: []
    },
    margin: {
      type: Object as () => Margin,
      default: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
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
      default: {}
    }
  },
  setup(props) {
    const chart = new Chart(props.data, props.config)
    const chartEl = ref(null)
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
      () => [props.direction, props.size, props.margin, props.axis],
      () => {
        if (chart)
          chart.changeConfig({
            direction: props.direction,
            size: props.size,
            margin: props.margin,
            axis: props.axis
          })
      },
      { immediate: true }
    )

    onMounted(() => {})

    onUnmounted(() => {
      console.log('unmounted')
    })

    function onMouseOut() {
      mouse.index = -1
      mouse.hover = false
    }

    function onMouseMove(e: MouseEvent) {
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
          mouse.index = bisectCenter(vals, primary.scale.invert(mouse.position.x))
        }
      } else {
        if (primary.type === 'band') {
          const band = primary.bandwidth()
          const delta = mouse.position.y - chart.canvas.y
          mouse.index = Math.round((delta + band / 2) / band) - 1
        } else {
          mouse.index = bisectCenter(vals, primary.scale.invert(mouse.position.y))
        }
      }
    }

    // function onTest() {
    //   if (chart) {
    //     const ticks = chart.scales.primary.ticks()
    //     console.log(ticks)
    //   }
    // }

    return { chartEl, onMouseMove, onMouseOut }
  }
})
</script>

<style>
.chart {
  position: relative;
}
</style>
