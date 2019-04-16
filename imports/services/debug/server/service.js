const Handlebars = require('handlebars')
import { moment } from 'meteor/momentjs:moment'

import { servicesAvailable } from '/imports/services/_root/server'

import { step, stepData } from '/imports/queue/server'

const puppeteer = require('puppeteer')

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
        const filesData = stepData(executionLogs, 'previous').filter(data => data.type === 'object')

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