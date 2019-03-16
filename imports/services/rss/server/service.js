import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/server'

import { stepData } from '/imports/queue/server'

const service = {
  name: 'rss',
  humanName: i18n.__('s-rss.name'),
  inputable: true,
  stepable: false,
  ownable: true,
  hooks: {
    // channel: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'new-content',
      humanName: i18n.__('s-rss.events.new-content.name'),
      visibe: true,
      callback: (channel, flow, user, currentStep, executionLogs, executionId, logId, cb) => {
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