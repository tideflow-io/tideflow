import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/server'
import { Flows } from '/imports/modules/flows/both/collection'

const ensureUniqueEndpoint = (endpoint, flowId) => {
  let q = {
    'trigger.type': 'endpoint',
    'trigger.config.endpoint': endpoint
  }

  if (flowId) q._id = { $ne: flowId }

  return Flows.findOne(q)
}

const service = {
  name: 'endpoint',
  humanName: i18n.__('s-endpoint.name'),
  inputable: true,
  stepable: false,
  ownable: false,
  hooks: {
    trigger: {
      update: {
        pre: (previousFlow, newFlow, toBeReturned) => {
          if (toBeReturned !== 'new') return previousFlow.trigger
          let alreadyExists = ensureUniqueEndpoint(newFlow.trigger.config.endpoint, newFlow._id)
          if (alreadyExists) throw new Meteor.Error('trigger-already-used')
          return newFlow.trigger
        }
      }
    },
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
      visibe: true,
      capabilities: {
        runInOneGo: true
      },
      callback: (user, currentStep, executionLogs, execution, logId, cb) => {
        const lastData = executionLogs[0].result

        cb(null, {
          result: lastData,
          next: true,
          msgs: [
            {
              m: 's-endpoint.log.called_input_parsed',
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