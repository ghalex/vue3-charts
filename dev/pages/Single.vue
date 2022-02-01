<template>
  <div>
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
              <!-- </Group> -->
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/runtime-core'
import * as mockup from '@/mockup'
import { scaleOrdinal } from 'd3-scale'

export default defineComponent({
  setup() {
    const data = ref<any>(mockup.notUniqueData)
    const margin = ref({
      left: 150,
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

    return { data, margin, getTooltipColor }
  }
})
</script>

<style>
.chart svg {
  border: 1px solid red;
}
</style>
