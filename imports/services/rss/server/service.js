import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/server'

import { stepData } from '/imports/queue/server'

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
        cb(null, stepData(executionLogs, 'last'))
      },
      conditions: [
        // {}
      ]
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)