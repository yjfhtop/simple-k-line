import rollupProConfig from './rollup.config.production'
import rollupConfig, { LibName, resolveFile } from './rollup.config'

// 热更新
import livereload from 'rollup-plugin-livereload'

// 本地服务
import serve from 'rollup-plugin-serve'

const rollupDveConfig = {
    ...rollupConfig,
}

rollupDveConfig.plugins = [
    ...rollupConfig.plugins,
    serve({
        open: true,
        port: 8858,
        contentBase: '',
    }),
    livereload({
        watch: 'dist',
    }),
]

rollupProConfig.output.file = resolveFile(`dist/index.js`)

export default rollupDveConfig
