import { servicesAvailable } from '/imports/services/_root/server'

const uuidv4 = require('uuid/v4')

const service = {
  name: 'gh-webhooks',
  inputable: true,
  stepable: false,
  ownable: true,
  hooks: {
    // trigger: {}
    service: {
      create: {
        pre: (service) => {
          return Object.assign(service, {
            config: {
              endpoint: uuidv4(),
              secret: uuidv4() 
            }
          }) 
        }
      },
      update: {
        pre: (existing, update) => {
          const { endpoint, secret } = existing.config
          const config = Object.assign(update.config || {}, { endpoint, secret })
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
      humanName: 's-gh-webhooks.events.called.name',
      visibe: true,
      capabilities: {
        runInOneGo: true
      },
      callback: (user, currentStep, executionLogs, execution, logId, cb) => {
        const lastData = ([].concat(executionLogs).pop() || {}).result

        cb(null, {
          result: lastData,
          next: true,
          msgs: [
            {
              m: 's-gh-webhooks.log.called_input_parsed',
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