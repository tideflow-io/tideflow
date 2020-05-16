import { servicesAvailable } from '/imports/services/_root/server'

import { instance as iotData } from './helpers/iotData'

const awsResponse = (err, data, success, cb) => {
  const lines = err ? [{
    m: err.message,
    err: true,
    p: [],
    d: new Date()
  }] : [{
    m: success,
    p: [],
    d: new Date()
  }]
  
  cb(null, {
    result: { data },
    error: !!err,
    next: true,
    msgs: lines
  })
}

const service = {
  name: 'aws-mqtt-client',
  humanName: 's-aws-mqtt-client.name',
  inputable: false,
  stepable: true,
  ownable: true,
  templates: {},
  events: [
    {
      name: 'message',
      capabilities: {
        runInOneGo: true
      },
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        const lastData = executionLogs[0].stepResult

        console.log({lastData})

        cb(null, {
          result: lastData,
          next: true,
          msgs: [
            {
              m: 's-endpoint.log.called_input_parsed',
              p: null,
              d: new Date()
            }
          ]
        })
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)
