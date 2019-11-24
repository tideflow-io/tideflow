import { servicesAvailable } from '/imports/services/_root/server'

import filesLib from '/imports/modules/files/server/lib'

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
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        const string = await filesLib.getOneAsString({ _id: currentStep.config.ymlFile })
        const flags = _.chain(executionLogs.map(el => el.stepResult)).filter(['type', 'object']).map('data').reduce((i, m)=> Object.assign(i,m)).value()

        try {
          let result = await webparsy.init({string, flags})
          cb(null, {
            result: {
              type: 'object',
              data: result
            },
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
        catch (ex) {
          cb(null, {
            result: {},
            next: false,
            error: true,
            msgs: [
              {
                m: 's-webparsy.log.scrape.yaml.errorTitle',
                err: false,
                d: new Date()
              },
              {
                m: ex.toString(),
                err: false,
                d: new Date()
              }
            ]
          })
        }
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)