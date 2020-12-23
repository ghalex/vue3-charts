<template>
  <h2>Charts here</h2>
  <div class="layout">
    <Chart :width="400" :height="350" :data="data" :margin="margin">
      <Grid strokeDasharray="3,3" />
      <Line type="monotone" dataKey="pv" fill="red" />
      <Area type="monotone" dataKey="pv" fill="blue" />
      <Line type="monotone" dataKey="uv" stroke="red" />
      <YMarker :value="3000" color="green" label="min" />
      <YMarker :value="6000" color="blue" label="max" />
      <XAxis />
      <YAxis />
      <template #widgets>
        <Tooltip format=",.0f" />
      </template>
    </Chart>

    <Responsive class="container">
      <template #main="{ width }">
        <Chart :width="width" :height="350" :data="data" :margin="margin">
          <Grid strokeDasharray="3,3" />
          <Bar dataKey="uv" fill="#82ca9d" />
          <Bar dataKey="pv" fill="#8884d8" />
          <Line type="monotone" dataKey="pv" stroke="green" />
          <YMarker :value="3000" color="green" label="min" />
          <YMarker :value="6000" color="blue" label="max" />
          <XAxis />
          <YAxis :domain="['0', 'dataMax']" format="$,.0f" />
          <template #widgets>
            <Tooltip format=",.0f" />
          </template>
        </Chart>
      </template>
    </Responsive>
  </div>
  <div class="layout">
    <Treemap :width="400" :height="350" :data="data" :margin="margin" dataKey="pv" />
  </div>

  <div>
    <button @click="setData">Data 1</button>
    <button @click="setData2">Data 2</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

import mockupData from '@/mockup/pages'
import mockupData2 from '@/mockup/pages2'

export default defineComponent({
  name: 'App',
  components: {},
  setup() {
    const margin = { top: 0, right: 0, bottom: 0, left: 0 }
    const data = ref(mockupData)

    function setData() {
      data.value = mockupData
    }

    function setData2() {
      data.value = mockupData2
    }

    return { data, margin, setData, setData2 }
  }
})
</script>

<style lang="scss">
@import './assets/main.css';

.layout {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

.container {
  width: 100%;
  margin-left: 10px;
  min-height: 300px;
}

.ml-2 {
  margin-left: 8px;
}
</style>
