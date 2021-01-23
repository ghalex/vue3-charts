import { createApp } from 'vue'
import App from './App.vue'

import * as components from '@/lib/components'
import router from '@/docs/routes'

import './assets/main.css'

const app = createApp(App)

Object.keys(components).forEach((name) => {
  const Component = (components as any)[name]
  app.component(name, Component)
})

app.use(router)
app.mount('#app')
