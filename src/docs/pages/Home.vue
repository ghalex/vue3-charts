<template>
  <HomeLayout>
    <div class="flex justify-center">
      <Chart class="mx-2" :width="500" :height="350" :data="data" :margin="margin">
        <Grid strokeDasharray="3,3" />
        <YMarker :value="0" color="#000" strokeDasharray="0" strokeWidth="1" strokeOpacity="1" />
        <Bar dataKey="pl" :fill="barFill" />
        <Line type="monotone" dataKey="pl" fill="red" />
        <XAxis />
        <YAxis :ticks="8" />
        <template #widgets>
          <Tooltip format=",.0f" :labels="{ pl: 'revenue' }" />
        </template>
      </Chart>

      <Chart class="mx-2" :width="400" :height="350" :data="data2" :margin="margin">
        <Grid strokeDasharray="3,3" />
        <Bar dataKey="uv" fill="#82ca9d" />
        <Bar dataKey="pv" fill="#8884d8" />
        <Line type="monotone" dataKey="pv" stroke="red" />
        <YMarker :value="3000" color="green" label="min" />
        <YMarker :value="6000" color="blue" label="max" />
        <XAxis />
        <YAxis :domain="['0', 'dataMax']" format="$,.0f" />
        <template #widgets>
          <Tooltip format=",.0f" />
        </template>
      </Chart>
    </div>
  </HomeLayout>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { HomeLayout } from '@/docs/layouts'
import { montshData, pagesData } from '@/docs/data'
import { Rectangle } from '@/lib/types'

export default defineComponent({
  components: { HomeLayout },
  setup() {
    const margin = { top: 0, right: 0, bottom: 0, left: 0 }
    const data = ref([] as any)
    const data2 = ref([] as any)

    const barFill = ({ props }: Rectangle) => {
      return props.d > 0 ? '#82ca9d' : '#b82c0d'
    }

    onMounted(() => {
      data.value = montshData
      data2.value = pagesData
    })
    return { data, data2, barFill, margin }
  }
})
</script>

<style></style>
