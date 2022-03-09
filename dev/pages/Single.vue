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
          :barStyleSelected="{ fill: '#b1517f' }"
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

export default defineComponent({
  setup() {
    const data = ref<any>(mockup.plByMonth)
    const margin = ref({
      left: 10,
      top: 10,
      right: 10,
      bottom: 10
    })

    const selectedBar = ref(null)
    function onBarClick(bar: any) {
      selectedBar.value = bar
    }

    return { data, margin, selectedBar, onBarClick }
  }
})
</script>

<style>
.chart svg {
  border: 1px solid red;
}
</style>
