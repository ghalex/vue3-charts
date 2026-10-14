/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import cssInjectedByJs from 'vite-plugin-css-injected-by-js'
import pkg from './package.json' with { type: 'json' }

// Runtime dependencies are installed by the consumer, never inlined into the bundle.
const external = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)]

export default defineConfig({
  plugins: [
    vue(),
    // Keep the pre-Vite behaviour: component CSS is injected at runtime, no separate stylesheet to import.
    cssInjectedByJs(),
    dts({ include: ['src'], exclude: ['src/mockup', 'src/components/Labels'], tsconfigPath: './tsconfig.json' })
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'vue3-charts.esm.js' : 'vue3-charts.js')
    },
    sourcemap: true,
    // `public/` only holds playground assets.
    copyPublicDir: false,
    rollupOptions: {
      external: (id) => external.some((name) => id === name || id.startsWith(`${name}/`)),
      output: { exports: 'named' }
    }
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts']
  }
})
