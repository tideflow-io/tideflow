import { servicesAvailable } from '/imports/services/_root/server'

const service = {
  name: 'debug',
  inputable: false,
  stepable: true,
  ownable: false,
  events: [
    {
      name: 'e1',
      visibe: true,
      callback: (service, flow, user, currentStep, executionLogs, executionId, logId, cb) => {
        // const lastData = _.last(executionLogs) ? _.last(executionLogs).stepResults : null
        cb(null, {
          result: [{
            type: 'object',
            data: {
              a: 1
            }
          }],
          next: true,
          msgs: [
            {
              m: 's-debug.log.e1',
              p: [],
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