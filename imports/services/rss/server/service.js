import { servicesAvailable } from '/imports/services/_root/server'

const service = {
  name: 'rss',
  inputable: true,
  stepable: false,
  ownable: true,
  hooks: {
  },
  events: [
    {
      name: 'new-content',
      visibe: true,
      callback: (service, flow, user, currentStep, executionLogs, executionId, logId, cb) => {
        const lastData = _.last(executionLogs) ? _.last(executionLogs).stepResults : null
        cb(null, lastData)
      },
      conditions: [
        // {}
      ]
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)