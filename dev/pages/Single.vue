<template>
  <Chart
    :size="{ width: 800, height: 620 }"
    :data="data"
    :margin="margin"
    :direction="direction"
    :axis="axis"
  >
    <template #layers>
      <Grid strokeDasharray="2,2" />
      <Area
        :dataKeys="['name', 'pl']"
        type="normal"
        :areaStyle="{ fill: 'red' }"
      />
      <Line
        :dataKeys="['name', 'pl']"
        type="normal"
        :lineStyle="{
          stroke: '#9f7aea'
        }"
      />
      <defs>
        <linearGradient id="grad" gradientTransform="rotate(90)">
          <stop offset="0%" stop-color="#be90ff" stop-opacity="1" />
          <stop offset="100%" stop-color="white" stop-opacity="0.4" />
        </linearGradient>
      </defs>
    </template>

    <template #widgets>
      <Tooltip
        borderColor="#48CAE4"
        :config="{
          pl: { color: '#9f7aea' },
          avg: { hide: true },
          inc: { hide: true }
        }"
      />
    </template>
  </Chart>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/runtime-core'
import * as mockup from '@/mockup'

export default defineComponent({
  setup() {
    const data = ref<any>(mockup.plByMonth)
    const direction = ref('horizontal')
    const margin = ref({
      left: 10,
      top: 10,
      right: 10,
      bottom: 10
    })

    const axis = ref({
      primary: {
        type: 'band'
      },
      secondary: {
        domain: ['dataMin', 'dataMax + 100'],
        type: 'linear',
        ticks: 8
      }
    })

    return { data, margin, axis, direction }
  }
})
</script>

<style>
.chart svg {
  border: 1px solid red;
}
</style>
