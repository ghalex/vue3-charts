module.exports = {
  css: { extract: false },
  chainWebpack: (config) => {
    config.entry('app').clear()

    // add your custom entry point
    config.entry('app').add('./src/docs/index.ts')
  }
}
