import { createApp } from 'vue'
import Dev from './index.vue'
import router from './router'
// To register individual components where they are used (serve.vue) instead of using the
// library as a whole, comment/remove this import and it's corresponding "app.use" call
import ZebbraCharts from '@/index'

const app = createApp(Dev)
app.use(router)
app.use(ZebbraCharts)

app.mount('#app')
