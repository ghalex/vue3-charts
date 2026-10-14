<template>
  <Layer :dataKeys="dataKeys" type="bar">
    <text v-if="bars.length === 0">No Data</text>
    <rect
      v-for="(bar, i) in bars"
      class="chart-bar"
      v-bind="toSvgAttrs(resolveStyle(barStyle, { ...bar.props, active: i === mouse.index }, defaultStyle))"
      :key="i"
      :x="bar.x"
      :y="bar.y"
      :width="Math.max(bar.width, 0)"
      :height="Math.max(bar.height, 0)"
      @click="onBarClick(bar, i)"
    />
    <rect
      v-if="selectedBar"
      class="chart-bar"
      v-bind="toSvgAttrs(resolveStyle(barStyleSelected, { ...selectedBar.props }, defaultSelectedStyle))"
      :x="selectedBar.x"
      :y="selectedBar.y"
      :width="Math.max(selectedBar.width, 0)"
      :height="Math.max(selectedBar.height, 0)"
    />
  </Layer>
</template>

<script lang="ts">
import { defineComponent, inject, PropType } from 'vue'
import { useBars, useMouse } from '@/hooks'
import Layer from '../Layer/index.vue'
import { resolveStyle, toSvgAttrs } from '@/utils'
import { LayerProps, Rectangle, SeriesProps, StyleProp } from '@/types'

export type BarStyleArgs = SeriesProps & { active: boolean }

export default defineComponent({
  name: 'Bar',
  components: { Layer },
  emits: ['barClick'],
  props: {
    selectedBar: {
      type: Object as PropType<Rectangle | null>,
      default: null
    },
    barStyle: {
      type: [Function, Object] as PropType<StyleProp<BarStyleArgs>>,
      required: false
    },
    barStyleSelected: {
      type: [Function, Object] as PropType<StyleProp<SeriesProps>>,
      required: false
    },
    maxWidth: {
      type: Number,
      default: -1
    },
    dataKeys: {
      type: Object as PropType<[string, string]>,
      required: true
    },
    gap: {
      type: Number,
      default: 5
    }
  },
  setup(props, { emit }) {
    const mouse = useMouse()
    const { stacked = false, maxWidth = -1 } = inject<LayerProps>('layerProps', {})
    const { bars } = useBars(props.dataKeys, {
      maxWidth: Math.max(props.maxWidth, maxWidth),
      stacked,
      gap: props.gap,
      type: 'bar'
    })

    const defaultStyle = { fill: 'blue' }
    const defaultSelectedStyle = { fill: 'darkblue' }

    function onBarClick(bar: Rectangle, idx: number) {
      emit('barClick', { ...bar, idx })
    }

    return { bars, mouse, defaultStyle, defaultSelectedStyle, resolveStyle, toSvgAttrs, onBarClick }
  }
})
</script>
