import i18n from 'meteor/universe:i18n'

import { Services } from '/imports/modules/services/both/collection'
import { servicesAvailable, processableResults } from '/imports/services/_root/server'
import { ioTo } from '../../agent/server/socket'

const uuidv4 = require('uuid/v4')

const service = {
  name: 'spreadsheets',
  humanName: i18n.__('s-spreadsheets.name'),
  inputable: false,
  stepable: true,
  ownable: true,
  templates: {},
  hooks: {
    // step: {},
    // trigger: {}
    service: {
      create: {
        pre: service => {
          return Object.assign(service, {
            config: { token: uuidv4() }
          }) 
        }
      },
      update: {
        pre: (existing, update) => {
          const { token } = existing.config
          const config = Object.assign(update.config || {}, { token })
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
      name: 'pushRow',
      capabilities: {
        runInOneGo: false
      },
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        const { fullFlow } = execution

        const attachPrevious = (currentStep.config.inputLast || '') === 'yes'

        const agent = currentStep.config.agent
        const agentDoc = agent === 'any' ? 'any' : Services.findOne({_id: agent})
        const commandSent = ioTo(agentDoc, {
          flow: fullFlow._id,
          execution: execution._id,
          log: logId,
          step: currentStep._id,
          previous: attachPrevious ? JSON.stringify(
            processableResults(executionLogs, true)
          ) : null
        }, 'tf.agent.spreadsheets.pushRow')

        cb(null, {
          result: {},
          next: false,
          error: !commandSent,
          msgs: [
            {
              m: commandSent ? 's-spreadsheets.log.pushRow.sent.success' : 's-spreadsheets.log.pushRow.sent.error',
              err: !commandSent,
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
