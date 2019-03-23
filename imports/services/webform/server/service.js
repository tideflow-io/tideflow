import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/server'

import { step, stepData } from '/imports/queue/server'

const uuidv4 = require('uuid/v4')

const service = {
  name: 'webform',
  humanName: i18n.__('s-webform.name'),
  inputable: true,
  stepable: false,
  ownable: true,
  hooks: {
    channel: {
      create: {
        pre: (channel) => {
          const config = Object.assign(channel.config || {}, {endpoint: uuidv4()})
          return Object.assign(channel, { config }) 
        }
      }
    }
  },
  events: [
    {
      name: 'submitted',
      humanName: i18n.__('s-webform.events.submitted.name'),
      visibe: true,
      callback: (channel, flow, user, currentStep, executionLogs, executionId, logId, cb) => {
        cb(null, {
          result: stepData(executionLogs, 'last'),
          next: true,
          msgs: [
            {
              m: 's-webform.log.submitted_input_parsed',
              p: null,
              d: new Date()
            }
          ]
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