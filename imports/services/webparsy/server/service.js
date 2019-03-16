import { servicesAvailable } from '/imports/services/_root/server'

const webparsy = require('webparsy')

const service = {
  name: 'webparsy',
  inputable: false,
  stepable: true,
  ownable: true,
  templates: {
  },
  hooks: {
    // step: {},
    // trigger: {}
    channel: {
      create: {
        pre: (channel) => {
          return channel
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
      name: 'scrape',
      callback: async (channel, flow, user, currentStep, executionLogs, executionId, logId, cb) => {
        const yml = currentStep.config.yml
        let scrapingResult = await webparsy.init({string:yml})
        cb(null, {
          result: [{
            type: 'object',
            data: scrapingResult
          }],
          next: true,
          error: false,
          msgs: [
            {
              m: 's-webparsy.log.scrape.yaml.title',
              err: false,
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