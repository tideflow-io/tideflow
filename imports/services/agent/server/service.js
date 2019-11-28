import i18n from 'meteor/universe:i18n'

import { Services } from '/imports/modules/services/both/collection.js'
import filesLib from '/imports/modules/files/server/lib'
import { servicesAvailable, processableResults } from '/imports/services/_root/server'
import { ioTo } from './socket'

const uuidv4 = require('uuid/v4')

const service = {
  name: 'agent',
  humanName: i18n.__('s-agent.name'),
  inputable: false,
  stepable: true,
  ownable: true,
  templates: {},
  hooks: {
    // step: {},
    // trigger: {}
    service: {
      create: {
        pre: (service) => {
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
      name: 'execute',
      visibe: true,
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        const { fullFlow } = execution

        const command = await filesLib.getOneAsString({ _id: currentStep.config.commandFile })

        const attachPrevious = (currentStep.config.inputLast || '') === 'yes'

        const agent = currentStep.config.agent
        const agentDoc = agent === 'any' ? 'any' : Services.findOne({_id: agent})
        const commandSent = ioTo(agentDoc, {
          flow: fullFlow._id,
          execution: execution._id,
          log: logId,
          step: currentStep._id,
          command,
          previous: attachPrevious ? JSON.stringify(
            processableResults(executionLogs, true)
          ) : null
        }, 'tf.agent.execute')

        let callParameters = [currentStep.config.command]

        if (agentDoc) {
          callParameters.push(agentDoc._id || agentDoc)
        }

        cb(null, {
          result: {},
          next: false,
          error: !commandSent,
          msgs: [
            {
              m: commandSent ? 's-agent.log.execute.sent.success' : 's-agent.log.execute.sent.error',
              err: !commandSent,
              p: callParameters,
              d: new Date()
            }
          ]
        })
      }
    },
    
    {
      name: 'code_nodesfc',
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        const { fullFlow } = execution
        const attachPrevious = (currentStep.config.inputLast || '') === 'yes'
        const agent = currentStep.config.agent
        const agentDoc = agent === 'any' ? 'any' : Services.findOne({_id: agent})
        const command = await filesLib.getOneAsString({ _id: currentStep.config.commandFile })
        
        const commandSent = ioTo(agentDoc, {
          flow: fullFlow._id,
          execution: execution._id,
          log: logId,
          step: currentStep._id,
          code: command,
          previous: attachPrevious ? JSON.stringify(
            processableResults(executionLogs, true)
          ) : null
        }, 'tf.agent.code_nodesfc')

        cb(null, {
          result: {},
          next: false,
          error: !commandSent,
          msgs: [
            {
              m: commandSent ? 's-agent.log.code_nodesfc.sent.success' : 's-agent.log.code_nodesfc.sent.error',
              err: !commandSent,
              p: [agentDoc._id || agentDoc],
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