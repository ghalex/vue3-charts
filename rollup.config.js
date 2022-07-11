import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { exec } from 'child_process'
import path from 'path'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import typescript from 'rollup-plugin-typescript2'
import vue from 'rollup-plugin-vue'

import packageJson from './package.json'

const projectRoot = path.resolve(__dirname, '.')

// see https://github.com/ezolenko/rollup-plugin-typescript2/issues/201
const tscAlias = () => {
  return {
    name: 'tsAlias',
    writeBundle: () => {
      return new Promise((resolve, reject) => {
        exec('tsc-alias', function callback(error, stdout, stderr) {
          if (stderr || error) {
            reject(stderr || error)
          } else {
            resolve(stdout)
          }
        })
      })
    }
  }
}

export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'cjs',
      file: packageJson.main,
      sourcemap: true
    },
    {
      format: 'esm',
      file: packageJson.module,
      sourcemap: true
    }
  ],
  plugins: [
    alias({
      entries: [
        {
          find: '@',
          replacement: `${path.resolve(projectRoot, 'src')}`
        }
      ]
    }),
    peerDepsExternal(),
    resolve(),
    typescript(),
    vue(),
    postcss({ include: /(?<!&module=.*)\.css$/ }),
    commonjs(),
    tscAlias()
  ]
}
