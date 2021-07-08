import { App, Plugin } from 'vue'

// Import vue components
import * as components from '@/components'

const install: Exclude<Plugin['install'], undefined> = function installLib (app: App) {
  Object.entries(components).forEach(([componentName, component]) => {
    app.component(componentName, component)
  })
}

export default { install }

export * from './components'
export * from './hooks'
