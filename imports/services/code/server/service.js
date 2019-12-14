import { servicesAvailable, processableResults } from '/imports/services/_root/server'

const nodesfc = require('nodesfc')
const os = require('os')
const path = require('path')
const fs = require('fs')

const service = {
  name: 'code',
  inputable: false,
  stepable: true,
  ownable: false,
  templates: {},
  hooks: {
    // step: {},
    // trigger: {}
    // service: {}
  },
  events: [
    {
      name: 'run',
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        // const language = currentStep.config.language // not used atm
        const code = currentStep.config.code
        const tmpFileName = `${os.tmpdir}${path.sep}${new Date().getTime()}`

        let errored = false
        let result = null

        fs.writeFileSync(tmpFileName, code)

        let tmpResultsFile = `${tmpFileName}-previous-results`
        let previousResults = processableResults(executionLogs, false)
        fs.writeFileSync(tmpResultsFile, JSON.stringify(previousResults))

        try {
          result = await nodesfc.init({
            file: tmpFileName,
            env: {
              TF_PREVIOUS_STEPS: tmpResultsFile
            }
          })
        }
        catch (ex) {
          result = {stdLines: [], code: 999}
          errored = true
        }
        finally {
          fs.unlinkSync(tmpFileName)
          fs.unlinkSync(tmpResultsFile)
        }

        let messages = [{
          m: 's-code.log.run.title',
          err: false,
          d: new Date()
        }]

        messages = messages.concat(result.stdLines.map(line => { return { m: line.output, p: null, err: line.err, d: line.date } }))

        cb(null, {
          result: result ? {
            type: 'object',
            data: result
          } : {},
          next: true,
          error: errored || !!result.code,
          msgs: messages
        })
      },
      conditions: [
        // {}
      ]
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)
