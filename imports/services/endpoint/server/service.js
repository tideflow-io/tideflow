import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/server'

import { step, stepData } from '/imports/queue/server'

const uuidv4 = require('uuid/v4')

const service = {
  name: 'endpoint',
  humanName: i18n.__('s-endpoint.name'),
  inputable: true,
  stepable: false,
  ownable: true,
  hooks: {
    // step: {},
    // trigger: {}
    channel: {
      create: {
        pre: (channel) => {
          return Object.assign(channel, {
            config: { endpoint: uuidv4() }
          }) 
        }
      },
      delete: {
        pre: (channel) => {
          return channel
        }
      }
    }
  },
  events: [
    {
      name: 'called',
      humanName: i18n.__('s-endpoint.events.called.name'),
      visibe: true,
      callback: (channel, flow, user, currentStep, executionLogs, executionId, logId, cb) => {
        cb(null, {
          result: stepData(executionLogs, 'last'),
          next: true,
          msgs: [
            {
              m: 's-endpoint.log.called_input_parsed',
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