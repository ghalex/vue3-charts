import { createApp } from 'vue'
import App from './app.vue'
import * as components from '@/components'

const app = createApp(App)

Object.keys(components).forEach((name) => {
  const Component = (components as any)[name]
  app.component(name, Component)
})

app.mount('#app')
