import { servicesAvailable } from '/imports/services/_root/server'
import { fstat } from 'fs';

const nodesfc = require('nodesfc')
const os = require('os')
const path = require('path')
const fs = require('fs')

const service = {
  name: 'code',
  inputable: false,
  stepable: true,
  ownable: true,
  templates: {
  },
  hooks: {
    // step: {},
    // trigger: {}
    service: {
      create: {
        pre: (service) => {
          return service
        }
      },
      delete: {
        pre: (service) => {
          return service
        }
      }
    }
  },
  events: [
    {
      name: 'run',
      callback: async (service, flow, user, currentStep, executionLogs, executionId, logId, cb) => {

        const language = currentStep.config.language
        const code = currentStep.config.code

        const file = `${os.tmpdir}${path.sep}${new Date().getTime()}`
        fs.writeFileSync(file, code)

        let errored = false
        let result = null

        try {
          result = await nodesfc.init({file})
        }
        catch (ex) {
          console.log({ex})
          result = {stdLines: []}
          errored = true
        }

        console.log({code, file, result})

        let messages = [{
          m: 's-code.log.run.title',
          err: false,
          d: new Date()
        }]

        messages = messages.concat(result.stdLines.map(line => { return { m: line.output, p: null, err: line.err, d: line.date } }))

        cb(null, {
          result: result ? [{
            type: 'object',
            data: result
          }] : [],
          next: true,
          error: errored,
          msgs: messages
        })
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)