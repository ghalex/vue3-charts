## Vue3-Charts

<hr />

[![npm](https://img.shields.io/npm/dm/@zebbra/ui?style=flat-square)](https://www.npmjs.com/package/vue3-charts)
[![npm](https://img.shields.io/npm/v/@zebbra/ui?style=flat-square)](https://www.npmjs.com/package/vue3-charts)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

**Vue3-Charts** is a SVG-based charting library. It is very easy to use and highly customizable.

**Vue3-Charts** basic example:

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

This project is still in early development. New components will be added regularly.

- [x] Line Chart
- [ ] Area Chart
- [x] Column Chart
- [ ] Stacked Column Chart
- [x] Bar Chart
- [ ] Stacked Bar Chart
- [ ] Scatter Plot

## License

Copyright (c) 2018 [Zebbra contributors](https://github.com/ghalex/zebbra-ui/graphs/contributors)

Licensed under the [MIT license](https://github.com/ghalex/zebbra-ui/blob/HEAD/LICENSE).
