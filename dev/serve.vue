<template>
  <div>
    <div class="flex">
      <Responsive class="w-full">
        <template #main="{ width }">
          <Chart :size="{ width, height: 400 }" :data="data" :axis="axis" :margin="margin" :direction="direction">
            <template #layers>
              <Grid strokeDasharray="2,2" :center="false" />
              <HoverBar />
              <Group :maxWidth="50">
                <Bar :dataKeys="['name', 'avg']" :barStyle="{ fill: '#0096c7' }" />
                <Bar :dataKeys="['name', 'pl']" :barStyle="{ fill: '#FC96c7' }" />
              </Group>
              <!-- <Group :stacked="true" :maxWidth="50">
                <Bar
                  :dataKeys="['name', 'pl']"
                  :barStyle="
                    (props) => {
                      return {
                        fill: '#0a80a7',
                        fillOpacity: 0.8
                      }
                    }
                  "
                />
                <Bar :dataKeys="['name', 'avg']" :barStyle="{ fill: '#0096c7' }" />
                <Bar :dataKeys="['name', 'inc']" :barStyle="{ fill: '#48cae4' }" />
              </Group> -->
              <Line
                type="step"
                :dataKeys="['name', 'pl']"
                :lineStyle="{
                  stroke: '#e63946',
                  strokeWidth: 2
                }"
                :dotStyle="
                  ({ active }) => ({
                    stroke: 'red',
                    strokeWidth: 2,
                    fill: 'white',
                    r: active ? 6 : 4
                  })
                "
              />
              <Marker :value="1500" label="Avg." color="#e63946" strokeWidth="2" strokeDasharray="6 6" />
            </template>
            <template #widgets>
              <Tooltip
                hideLine
                :config="{
                  name: { hide: true },
                  inc: { color: '#48cae4' },
                  pl: { color: '#0077b6' },
                  avg: { label: 'averange', color: '#0096c7' }
                }"
              />
            </template>
          </Chart>
          <div>
            <button @click="add">Add Data</button>
            <button @click="updateConfig">Update Config</button>
          </div>
        </template>
      </Responsive>
    </div>
    <div class="flex">
      <div class="ml-2">
        <Chart
          :data="data2"
          :axis="{ primary: { type: 'linear', domain: ['0', 'dataMax'] } }"
          :margin="margin"
          :direction="direction"
        >
          <template #layers>
            <Grid strokeDasharray="2,2" />
            <Line :dataKeys="['nbOfTrades', 'pl']" type="monotone" />
            <Marker :value="100" label="Avg." color="blue" strokeWidth="2" strokeDasharray="6 6" />
          </template>
          <template #widgets>
            <Tooltip />
          </template>
        </Chart>
        <div>
          <button @click="test">Test</button>
        </div>
      </div>
      <div class="ml-2">
        <Chart :data="data3" :margin="margin" :direction="direction">
          <template #layers>
            <Grid strokeDasharray="2,2" />
            <!-- <Line :dataKeys="['name', 'pl']" type="monotone" /> -->
            <Line :dataKeys="['name', 'pl']" :lineStyle="{ strokeWidth: 2, stroke: 'red', strokeDasharray: '2,3' }" />
            <!-- <Group :stacked="true">
              <Area :dataKeys="['name', 'pl']" :areaStyle="{ fill: 'red' }" type="monotone" /> -->
            <Area :dataKeys="['name', 'pl']" :areaStyle="{ fill: 'blue' }" type="normal" />
            <!-- </Group> -->
            <Marker :value="0" label="0$" color="red" strokeDasharray="0" />
          </template>
          <template #widgets>
            <Tooltip color="red" hideLine />
          </template>
        </Chart>
        <div>
          <button>Add Data</button>
        </div>
      </div>
    </div>
    <div>
      <div class="ml-2">
        <Responsive class="w-full">
          <template #main="{ width }">
            <Treemap :size="{ width, height: 380 }" :dataKeys="['key', 'value']" :data="data4">
              <template #text="{ data }">
                <text :x="0 + 10" :y="0 + 20" :font-size="`15px`" :fill="`white`" font-weight="bold">
                  {{ data.name }}
                </text>
                <text :x="0 + 10" :y="0 + 40" :font-size="`15px`" :fill="`white`" font-weight="bold">
                  {{ data.value }}
                </text>
              </template>
            </Treemap>
          </template>
        </Responsive>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import * as mockup from '@/mockup'
import * as r from 'ramda'

export default defineComponent({
  name: 'App',
  setup() {
    const data = ref<any>(mockup.plByMonth)
    const data2 = ref(r.sortBy(r.prop('nbOfTrades'), mockup.trades))
    const data3 = ref<any>(mockup.plMonthYear)
    const data4 = ref(mockup.tags)

    const direction = ref('horizontal')
    const margin = ref({
      left: 0,
      top: 0,
      right: 20,
      bottom: 0
    })

    const axis = ref({
      primary: {
        type: 'band',
        tickValues: ['Jan', 'Feb', 'Jul'],
        format: (val: string) => {
          if (val === 'Feb') {
            return '😜'
          }

          return val
        }
      },
      secondary: {
        domain: ['dataMin', 'dataMax + 100'],
        type: 'linear',
        ticks: 4,
        //tickValues: [-500, 0, 500, 1500, 3000],
        format: (val: string) => {
          return val
        }
      }
    })

    function add() {
      const val = {
        name: 'M' + data.value.length,
        pl: Math.random() * 3000,
        avg: Math.random() * 1000,
        inc: Math.random() * 500
      }

      data.value = [...data.value, val]
    }

    function updateConfig() {
      direction.value = direction.value === 'horizontal' ? 'vertical' : 'horizontal'
    }

    function test() {
      console.log('click me')
    }

    return { data, data2, data3, data4, axis, margin, direction, add, updateConfig, test, console }
  }
})
</script>

<style scoped>
.flex {
  display: flex;
}

.w-full {
  width: 100%;
}

.mt-2 {
  margin-top: 1rem;
}
</style>
