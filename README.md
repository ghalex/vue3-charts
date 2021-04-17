<p align="center">
  <br>
  <a href="https://www.gridsome.org">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vue.js_Logo_2.svg/1184px-Vue.js_Logo_2.svg.png" width="90"/>
  </a>
</p>

<h1 align="center">Vue3-Charts</h1>
<h3 align="center">Data visualization in Vue3 made easy</h3>
<p align="center">
<b>Vue3-Charts</b> is a SVG-based charting library that is very easy to use and highly customizable.
</p>

<p align="center">
<a title="Total downloads" href="https://www.npmjs.com/package/vue3-charts">
    <img src="https://img.shields.io/npm/dm/vue3-charts.svg?style=flat-square">
  </a>
  <a title="Current version" href="https://www.npmjs.com/package/vue3-charts">
    <img src="https://img.shields.io/npm/v/vue3-charts.svg?style=flat-square">
  </a>
  <a title="MIT License" href="LICENSE">
    <img alt="GitHub" src="https://img.shields.io/github/license/ghalex/vue3-charts?style=flat-square">
  </a>
  <br>
  <br>
</p>

<p align="center">
<img src="https://github.com/ghalex/vue3-charts/raw/main/public/images/charts.png" width="650"/>
</p>

<hr/>

## Here is a basic example:

```xml
<div>
  <Chart :data="data" :axis="axis" :margin="margin" :direction="direction">
    <template #layers>
      <Grid strokeDasharray="2,2" />
      <Bar :dataKeys="['name', 'pl']" fill="#48CAE4" />
      <Bar :dataKeys="['name', 'avg']" fill="#00b4d8" />
      <Line :dataKeys="['name', 'avg']" stroke="#e76f51" type="step" />
    </template>
  </Chart>
</div>
```

```js
<script>
import { defineComponent } from 'vue'
import { plByMonth } from '@/data'

export default defineComponent({
  name: 'Main',
  setup() {
    const data = ref(plByMonth)

    const direction = ref('horizontal')
    const margin = ref({
      left: 0,
      top: 20,
      right: 20,
      bottom: 0
    })

    return {data, margin, direction}
  }
})
</script>
```

[View on Github](https://github.com/ghalex/vue3-charts)

## Components List

This project is still in early development. New charts will be added regularly.

- [x] Line Chart
- [x] Area Chart
- [x] Stacked Area Chart
- [x] Column Chart
- [x] Stacked Column Chart
- [x] Bar Chart
- [x] Stacked Bar Chart
- [ ] Scatter Plot

## License

Copyright (c) 2018 [Vue3-Charts Contributors](https://github.com/ghalex/vue3-charts/graphs/contributors)
Licensed under the [MIT license](https://github.com/ghalex/vue3-charts/blob/HEAD/LICENSE).
