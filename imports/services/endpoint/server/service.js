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
    service: {
      create: {
        pre: (service) => {
          return Object.assign(service, {
            config: { endpoint: uuidv4() }
          }) 
        }
      },
      update: {
        pre: (existing, update) => {
          const { endpoint } = existing.config
          const config = Object.assign(update.config || {}, { endpoint })
          return Object.assign(update, { config }) 
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
      name: 'called',
      humanName: i18n.__('s-endpoint.events.called.name'),
      visibe: true,
      callback: (service, flow, user, currentStep, executionLogs, executionId, logId, cb) => {
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