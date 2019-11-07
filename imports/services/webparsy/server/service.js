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
    service: {
      create: {
        pre: (service) => {
          return service
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
      name: 'scrape',
      callback: async (service, flow, triggerData, user, currentStep, executionLogs, executionId, logId, cb) => {

        const string = currentStep.config.yml

        const flags = _.chain(executionLogs.map(el => el.stepResult)).filter(['type', 'object']).map('data').reduce((i, m)=> Object.assign(i,m)).value()

        let result = [{
          type: 'object',
          data: await webparsy.init({string, flags})
        }]

        cb(null, {
          result,
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
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)