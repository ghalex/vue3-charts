import { scaleBand, scaleLinear } from 'd3-scale'
import { computed, inject, onMounted, ref, Ref, watch } from 'vue'
import { Layer, Point, Plane, Rectangle } from '@/types'
import { defaultTo } from 'ramda'

const emptyPlane: Plane = {
  data: [],
  xScale: scaleBand(),
  yScale: scaleLinear(),
  canvas: { x: 0, y: 0, width: 600, height: 300 },
  addLayer: (_: Layer) => {
    return
  }
}

export default (layer: Layer) => {
  const plane = inject<Ref<Plane>>('plane', ref(emptyPlane))
  const layers = inject('layers', ref<Layer[]>([]))

  const values = computed<number[]>(() => {
    return plane.value.data.map((d) => d[layer.dataKey])
  })

  const points = ref<Point[]>([])
  const rectangles = ref<Rectangle[]>([])

  function updatePoints() {
    const { xScale, yScale } = plane.value
    points.value = values.value.map((d, i) => {
      const p: Point = {
        x: (xScale(i.toString()) || 0) + xScale.bandwidth() / 2,
        y: yScale(d)
      }

      return p
    })
  }

  function updateRectangles() {
    const { xScale, yScale } = plane.value
    const gap = 10
    const barLayers = layers.value.filter((l) => l.type === 'bar')
    const index = barLayers.findIndex((l) => l.dataKey === layer.dataKey && l.type === layer.type)
    const maxWidth = xScale.bandwidth() - gap
    const barWidth = barLayers.length > 0 ? maxWidth / barLayers.length : maxWidth

    console.log(layer.id, layer.type, index, barLayers)
    rectangles.value = values.value.map((d, i) => {
      const r: Rectangle = {
        x: (xScale(i.toString()) || 0) + index * barWidth + gap / 2,
        y: yScale(d),
        width: barWidth,
        height: plane.value.canvas.height - yScale(d)
      }

      return r
    })
  }

  watch(
    layers,
    () => {
      updatePoints()
      if (layer.type === 'bar') {
        updateRectangles()
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    plane.value.addLayer(layer)
  })

  return {
    points,
    rectangles,
    values,
    canvas: plane.value.canvas,
    xScale: plane.value.xScale,
    yScale: plane.value.yScale
  }
}
