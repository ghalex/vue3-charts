<template>
  <!-- <div>
    <Responsive class="w-full">
      <template #main="{ width }">
        <Chart
            class="chart"
            direction="circular"
            :data="data"
            :config="{ controlHover: false }"
            :margin="margin"
            :axis="{ primary: { hide: true }, secondary: { hide: true }}"
            :size="{ width, height: 400 }"
          >
            <template #layers>
              <Pie :dataKeys="['name', 'avg']"  />
            </template>
            <template #widgets>
              <Tooltip
                :config="{
                  name: { hide: false },
                  pl: { hide: true },
                  inc: { hide: true },
                  avg: { label: 'averange', color: getTooltipColor }
                }"
                hideLine />
            </template>
          </Chart>
      </template>
    </Responsive>
  </div> -->
  <div class="flex">
    <Chart
      :size="{ width: 800, height: 400 }"
      :data="data"
      :axis="axis"
      :margin="margin"
      :direction="direction"
    >
      <template #layers>
        <Grid strokeDasharray="2,2" :center="false" />
        <HoverBar />
        <Bar
          :dataKeys="['name', 'avg']"
          :barStyle="{ fill: '#FC96c7' }"
          :selectedBar="selectedBar"
          @bar-click="onBarClick"
        />
      </template>
    </Chart>
    <div v-if="selectedBar">
      <div>Selected bar index: {{selectedBar.idx}}</div>
      <div>Selected bar props: {{selectedBar.props}}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/runtime-core'
import * as mockup from '@/mockup'
import { scaleOrdinal } from 'd3-scale'

export default defineComponent({
  setup() {
    const data = ref<any>(mockup.plByMonth)
    const margin = ref({
      left: 10,
      top: 10,
      right: 10,
      bottom: 10
    })

    const colors = scaleOrdinal()
      .range(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c'])
      .domain(Array.from(Array(3).keys()).map(x => x.toString()))

    function getTooltipColor({ idx }: {idx: number}) {
      return colors(idx.toString())
    }

    const selectedBar = ref(null)
    function onBarClick(bar: any) {
      selectedBar.value = bar
    }

    return { data, margin, selectedBar, onBarClick, getTooltipColor }
  }
})
</script>

<style>
.chart svg {
  border: 1px solid red;
}
</style>
