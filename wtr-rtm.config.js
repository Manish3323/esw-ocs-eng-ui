import plugin from '@snowpack/web-test-runner-plugin'
import { importMapsPlugin } from '@web/dev-server-import-maps'
import { defaultReporter } from '@web/test-runner'
// eslint-disable-next-line import/no-unresolved
import ConsoleReporter from './ConsoleReporter.js'
// eslint-disable-next-line import/no-unresolved
import { RTMReporter } from './dist/test/utils/RTMReporter.js'
// NODE_ENV=test - Needed by "@snowpack/web-test-runner-plugin"
process.env.NODE_ENV = 'test'

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
  reporters: [defaultReporter({ reportTestResults: true, reportTestProgress: true }), ConsoleReporter(), RTMReporter()],
  coverageConfig: {
    exclude: ['_snowpack/**/*'],
    threshold: { statements: 90, branches: 85, functions: 64, lines: 90 }
  }
}
