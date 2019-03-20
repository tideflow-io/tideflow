import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/server'

import { step, stepData } from '/imports/queue/server'

const uuidv4 = require('uuid/v4')

const service = {
  name: 'datatable',
  inputable: true,
  stepable: true,
  ownable: true,
  hooks: {
    // step: {},
    // trigger: {}
    channel: {
      create: {
        pre: (channel) => {
          return Object.assign(channel, {
            config: { headers: [
              {
                name: 'name',
                label: 'Name',
                type: 'string'
              },
              {
                name: 'avg',
                label: 'Average',
                type: 'number'
              }
            ] }
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
      name: 'record-update',
      callback: (channel, flow, user, currentStep, executionLogs, executionId, logId, cb) => {
        cb(null, {
          result: stepData(executionLogs, 'last'),
          next: true,
          msgs: [
            {
              m: 's-datatable.log.updated',
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