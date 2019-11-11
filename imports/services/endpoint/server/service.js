import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/server'

const service = {
  name: 'endpoint',
  humanName: i18n.__('s-endpoint.name'),
  inputable: true,
  stepable: false,
  ownable: true,
  hooks: {
    // step: {},
    // trigger: {}
    /* service: {
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
    } */
  },
  events: [
    {
      name: 'called',
      humanName: i18n.__('s-endpoint.events.called.name'),
      visibe: true,
      callback: (user, currentStep, executionLogs, execution, logId, cb) => {
        const lastData = executionLogs[executionLogs.length - 1].stepResult

        cb(null, {
          result: lastData,
          next: true,
          msgs: [
            {
              m: 's-endpoint.log.called_input_parsed',
              p: null,
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