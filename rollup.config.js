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

// Runtime dependencies are installed by the consumer (see package.json `dependencies`),
// so they must not be inlined into the bundle.
const external = [...Object.keys(packageJson.dependencies), ...Object.keys(packageJson.peerDependencies)].map(
  (name) => new RegExp(`^${name}(/|$)`)
)

export default {
  input: 'src/index.ts',
  external,
  output: [
    {
      format: 'cjs',
      file: packageJson.main,
      exports: 'named',
      sourcemap: true
    },
    {
      format: 'esm',
      file: packageJson.module,
      exports: 'named',
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
    // picomatch >= 4 no longer matches rpt2's default `**/*.ts+(|x)` extglob, so be explicit
    typescript({ include: ['**/*.ts', '**/*.tsx'] }),
    vue(),
    postcss({ include: /(?<!&module=.*)\.css$/ }),
    commonjs(),
    tscAlias()
  ]
}
