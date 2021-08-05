import plugin from '@snowpack/web-test-runner-plugin'
import { importMapsPlugin } from '@web/dev-server-import-maps'
import { defaultReporter } from '@web/test-runner'
// eslint-disable-next-line import/no-unresolved
import ConsoleReporter from './ConsoleReporter.js'

// NODE_ENV=test - Needed by "@snowpack/web-test-runner-plugin"
process.env.NODE_ENV = 'test'
console.log('process.logs', process.env.ESW_OCS_ENG_UI_LOGS)
export default {
  testFramework: {
    config: {
      timeout: '3000'
    }
  },
  plugins: [
    plugin(),
    importMapsPlugin({
      inject: {
        importMap: {
          imports: {
            './dist/features/sequencer/hooks/useSequencerService.js': './dist_test/mocks/useSequencerService.js',
            './dist/contexts/ConfigServiceContext.js': './dist_test/mocks/ConfigServiceContext.js'
          }
        }
      }
    })
  ],
  reporters: [defaultReporter({ reportTestResults: true, reportTestProgress: true }), ConsoleReporter()],
  browserLogs: Boolean(process.env.ESW_OCS_ENG_UI_LOGS)
}
