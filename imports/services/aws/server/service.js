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
  name: 'aws',
  humanName: 's-aws.name',
  inputable: false,
  stepable: true,
  ownable: true,
  templates: {},
  events: [
    {
      name: 'iot-shadow-get',
      capabilities: {
        runInOneGo: true
      },
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        let client = await iotData(currentStep, execution)
        client.getThingShadow({
          thingName: currentStep.config.thingName
        }, (err, data) => {
          awsResponse(err, JSON.parse(data.payload), 's-aws.log.iot-shadow-get.ok', cb)
        })
      }
    },
    {
      name: 'iot-shadow-update',
      capabilities: {
        runInOneGo: true
      },
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        const lastData = ([].concat(executionLogs).pop() || {}).stepResult
        const shadowData = lastData ? lastData.data || {} : {}

        let client = await iotData(currentStep, execution)
        client.updateThingShadow({
          thingName: currentStep.config.thingName,
          payload: Buffer.from(JSON.stringify({state: shadowData}))
        }, (err, data) => {
          awsResponse(err, data, 's-aws.log.iot-shadow-update.ok', cb)
        })
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)
