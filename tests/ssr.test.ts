import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Bar, Chart, Line, Tooltip } from '@/components'

const data = [
  { name: 'Jan', avg: 0, pl: 10 },
  { name: 'Feb', avg: 20, pl: 5 },
  { name: 'Mar', avg: 30, pl: 40 }
]

// tests/setup.ts stubs ResizeObserver for jsdom; a server (Nuxt SSR) has none at all, so remove it here.
const stub = globalThis.ResizeObserver

describe('server-side rendering', () => {
  beforeEach(() => {
    // @ts-expect-error -- simulate Node, where the global does not exist
    delete globalThis.ResizeObserver
  })

  afterEach(() => {
    globalThis.ResizeObserver = stub
  })

  it('renders a chart to a string without browser globals', async () => {
    const app = createSSRApp({
      render: () =>
        h(
          Chart,
          { data, size: { width: 400, height: 300 } },
          {
            layers: () => [h(Bar, { dataKeys: ['name', 'avg'] }), h(Line, { dataKeys: ['name', 'pl'] })],
            widgets: () => h(Tooltip)
          }
        )
    })

    const html = await renderToString(app)

    expect(html).toContain('<svg')
    expect(html).toContain('class="layers"')
    expect(html).toContain('class="widgets"')
  })
})
