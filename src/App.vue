<template>
  <h2>Charts here</h2>
  <div class="layout">
    <Chart :width="400" :height="350" :data="data" :margin="margin">
      <Grid />
      <Line type="monotone" dataKey="pv" fill="red" />
      <Area type="monotone" dataKey="pv" fill="blue" />
      <Line type="monotone" dataKey="uv" stroke="red" />
      <XAxis />
      <YAxis />
      <template #tooltip>
        <Tooltip />
      </template>
    </Chart>
    <Chart class="ml-2" :width="400" :height="300" :data="data" :margin="margin">
      <Grid />
      <Bar dataKey="uv" fill="#82ca9d" />
      <Bar dataKey="pv" fill="#8884d8" />
      <!-- <Line dataKey="uv" stroke="red" /> -->
      <Tooltip />
      <XAxis />
      <YAxis />
      <template #tooltip>
        <Tooltip />
      </template>
    </Chart>
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
  setup() {
    const margin = { top: 0, right: 0, bottom: 0, left: 0 }
    const data = ref([] as any[])

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

.ml-2 {
  margin-left: 8px;
}
</style>
