import i18n from 'meteor/universe:i18n'

import { Services } from '/imports/modules/services/both/collection'
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
      capabilities: {
        runInOneGo: false
      },
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        const { fullFlow } = execution

        let command = null

        try {
          command = await filesLib.getOneAsString({ _id: currentStep.config.commandFile })
        }
        catch (ex) {
          cb(null, {
            result: {},
            next: false,
            error: true,
            msgs: [
              {
                m: 's-agent.log.execute.commandfile.error',
                err: true,
                d: new Date()
              }
            ]
          })
          return
        }

        const agent = currentStep.config.agent
        const agentDoc = agent === 'any' ? 'any' : Services.findOne({_id: agent})
        const agentName =  agent === 'any' ? 'any' : agentDoc.title
        const commandSent = ioTo(agentDoc, {
          flow: fullFlow._id,
          execution: execution._id,
          log: logId,
          step: currentStep._id,
          command,
          previous: JSON.stringify(
            processableResults(executionLogs, true)
          )
        }, 'tf.agent.execute')

        cb(null, {
          result: {},
          next: false,
          error: !commandSent,
          msgs: [
            {
              m: commandSent ? 's-agent.log.execute.sent.success' : 's-agent.log.execute.sent.error',
              p: {agentName},
              err: !commandSent,
              d: new Date()
            }
          ]
        })
      }
    },
    
    {
      name: 'code_nodesfc',
      capabilities: {
        runInOneGo: false
      },
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        const { fullFlow } = execution
        const agent = currentStep.config.agent
        const agentDoc = agent === 'any' ? 'any' : Services.findOne({_id: agent})
        const agentName =  agent === 'any' ? 'any' : agentDoc.title

        let command = null

        try {
          command = await filesLib.getOneAsString({ _id: currentStep.config.commandFile })
        }
        catch (ex) {
          cb(null, {
            result: {},
            next: false,
            error: true,
            msgs: [
              {
                m: 's-agent.log.code_nodesfc.commandfile.error',
                p: {agentName},
                err: true,
                d: new Date()
              }
            ]
          })
          return
        }
        
        const commandSent = ioTo(agentDoc, {
          flow: fullFlow._id,
          execution: execution._id,
          log: logId,
          step: currentStep._id,
          code: command,
          previous: JSON.stringify(
            processableResults(executionLogs, true)
          )
        }, 'tf.agent.code_nodesfc')

        cb(null, {
          result: {},
          next: false,
          error: !commandSent,
          msgs: [
            {
              m: commandSent ? 's-agent.log.code_nodesfc.sent.success' : 's-agent.log.code_nodesfc.sent.error',
              err: !commandSent,
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
