import type { TestSuiteResult } from '@web/test-runner'
// eslint-disable-next-line import/no-nodejs-modules
import * as fs from 'fs'
// eslint-disable-next-line import/no-nodejs-modules
import * as os from 'os'

const PIPE = '|'
const PIPE_WITH_SPACES = ' | '
const SPACE = ' '
const COMMA = ','

export const deleteFile = (outputPath: fs.PathLike): void => {
  fs.unlink(outputPath, (err) => {
    if (err) {
      console.error(err)
    }
  })
}

export const writeArrayToFile = (results: TestSuiteResult, OUTPUT_PATH: string): Promise<void> => {
  return new Promise((resolve) => {
    const stream = fs.createWriteStream(OUTPUT_PATH, {
      flags: 'a+'
    })
    stream.on('open', () => {
      sanitizeTestSuite(results).forEach(function (item) {
        stream.write(item + os.EOL)
      })
      stream.end()
      resolve()
    })
  })
}

const getArgumentValue = (data: string[], outputRegex: RegExp) => {
  return data.filter((x) => x.match(outputRegex)).map((x) => x.split('=')[1])[0]
}

export const parseOutput = (args: string[], outputRegex = new RegExp('output|OUTPUT')): string => {
  return getArgumentValue(args, outputRegex)
}

const buildResultText = (storyId: string, name: string, status: boolean) => {
  const ts = status ? 'PASSED' : 'FAILED'
  return `${storyId.trim() + PIPE_WITH_SPACES + name.trim() + PIPE_WITH_SPACES + ts}`
}

const sanitizeTestSuite = (suite: TestSuiteResult): string[] => {
  const listOfStrings: string[] = []
  if (!!suite.tests && suite.tests.length > 0) {
    suite.tests.forEach((test) => {
      const [testName, storyIds] = test.name.split(PIPE)
      const name = suite.name + SPACE + testName
      if (Boolean(storyIds)) {
        storyIds
          .trim()
          .split(COMMA)
          .forEach((storyId: string) => listOfStrings.push(buildResultText(storyId, name, test.passed)))
      } else {
        listOfStrings.push(buildResultText('None', name, test.passed))
      }
    })
  }
  return listOfStrings
}
