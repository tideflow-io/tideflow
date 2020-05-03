import { servicesAvailable } from '/imports/services/_root/server'

import { ioTo } from '/imports/services/agent/server/socket'
import filesLib from '/imports/modules/files/server/lib'

import { Services } from '/imports/modules/services/both/collection'
import { Executions } from '/imports/modules/executions/both/collection'

import { createCheckrun, updateCheckrun } from './ghApi'

const uuidv4 = require('uuid/v4')

const sendAgent = (agentId, flow, execution, logId, currentStep, topic, data) => {
  const agentDoc = agentId === 'any' ? 'any' : Services.findOne({_id: agentId})
  return ioTo(agentDoc, Object.assign( {
    flow: flow._id,
    execution: execution._id,
    log: logId,
    step: currentStep ? currentStep._id : null
  }, data || {}), topic)
}

const service = {
  name: 'gh-ci',
  inputable: true,
  stepable: false,
  ownable: true,
  hooks: {
    // step: {},
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
      name: 'pull_request',
      humanName: 's-gh-ci.events.pull_request.name',
      viewerTitle: 's-gh-ci.events.pull_request.viewer.title',
      inputable: true,
      stepable: false,

      /**
       * @param {object} user Flow's owner information, excluding password, services, etc. As in database 
       * @param {object} currentStep The flow's current step object
       * @param {array} executionLogs
       * @param {object} execution
       * @param {string} logId
       * @param {function} cb
       */
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        const { fullFlow, fullService, triggerData } = execution
        const agent = currentStep.config.agent
        const webhook = triggerData.data

        const commandSent = sendAgent(agent, fullFlow, execution, logId, currentStep, 'tf.githubCi.pullRequest', {
          triggerService: fullService,
          webhook
        })

        cb(null, {
          result: {},
          next: false,
          error: !commandSent,
          msgs: [
            {
              m: commandSent ? 's-gh-ci.events.pull_request.agent.sent.success' : 's-gh-ci.events.pull_request.agent.sent.error',
              err: !commandSent,
              d: new Date()
            }
          ]
        })
      },

      executionFinished: async (user, execution, cb) => {
        const { fullFlow } = execution
        const commandSent = sendAgent(fullFlow.trigger.config.agent, fullFlow, execution, null, null, 'tf.githubCi.pullRequest.execution.finished', {})
        cb(!commandSent, null)
      }
    },
    
    {
      name: 'push',
      humanName: 's-gh-ci.events.push.name',
      viewerTitle: 's-gh-ci.events.push.viewer.title',
      inputable: true,
      stepable: false,
      
      /**
       * @param {object} user Flow's owner information, excluding password, services, etc. As in database 
       * @param {object} currentStep The flow's current step object
       * @param {array} executionLogs
       * @param {object} execution
       * @param {string} logId
       * @param {function} cb
       */
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        const { fullService, fullFlow, triggerData } = execution
        const agentId = fullFlow.trigger.config.agent
        const webhook = triggerData.data
        const commandSent = sendAgent(agentId, fullFlow, execution, logId, currentStep, 'tf.githubCi.push', {
          triggerService: fullService,
          webhook
        })

        cb(null, {
          result: {},
          next: false,
          error: !commandSent,
          msgs: [
            {
              m: commandSent ? 's-gh-ci.events.push.agent.sent.success' : 's-gh-ci.events.push.agent.sent.error',
              err: !commandSent,
              d: new Date()
            }
          ]
        })
      },

      executionFinished: async (user, execution, cb) => {
        const { fullFlow } = execution
        const agentId = fullFlow.trigger.config.agent
        const commandSent = sendAgent(agentId, fullFlow, execution, null, null, 'tf.githubCi.push.execution.finished', {})
        cb(!commandSent, null)
      }
    },

    {
      name: 'checksuite',
      humanName: 's-gh-ci.events.checksuite.name',
      viewerTitle: 's-gh-ci.events.checksuite.viewer.title',
      inputable: true,
      stepable: false,
      
      /**
       * @param {object} user Flow's owner information, excluding password, services, etc. As in database 
       * @param {object} currentStep The flow's current step object
       * @param {array} executionLogs
       * @param {object} execution
       * @param {string} logId
       * @param {function} cb
       */
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        const { fullService, fullFlow } = execution
        const webhook = execution.triggerData.data

        const agentId = fullFlow.trigger.config.agent
        const commandSent = sendAgent(agentId, fullFlow, execution, logId, currentStep, 'tf.githubCi.checksuite', {
          triggerService: fullService,
          webhook
        })

        if (commandSent) {
          let checkRun = await createCheckrun(fullService, webhook, execution, 'in_progress')
          Executions.update(
            { _id: execution._id },
            { $set: {
              'extras.checkRun': checkRun.data
            } }
          )
        }

        cb(null, {
          result: {},
          next: false,
          error: !commandSent,
          msgs: [
            {
              m: commandSent ? 's-gh-ci.events.checksuite.agent.sent.success' : 's-gh-ci.events.checksuite.agent.sent.error',
              err: !commandSent,
              d: new Date()
            }
          ]
        })
      },

      executionFinished: async (user, execution, cb) => {
        const { fullService, fullFlow, status } = execution
        const webhook = execution.triggerData.data
        const checkRun = execution.extras.checkRun
        const conclusion = status === 'finished' ? 'success' : status === 'error' ? 'failure' : 'neutral'
        const commandSent = sendAgent(fullFlow.trigger.config.agent, fullFlow, execution, null, null, 'tf.githubCi.checksuite.execution.finished', {})
        await updateCheckrun(fullService, webhook, checkRun, 'completed', conclusion)
        cb(!commandSent, null)
      }
    },

    {
      name: 'run_cmd',
      humanName: 's-gh-ci.events.run_cmd.name',
      viewerTitle: 's-gh-ci.events.run_cmd.viewer.title',
      inputable: false,
      stepable: true,
      templates: {
        eventConfig: 'servicesGithubCiBasicStep'
      },
      
      /**
       * @param {object} user Flow's owner information, excluding password, services, etc. As in database 
       * @param {object} currentStep The flow's current step object
       * @param {array} executionLogs
       * @param {object} execution
       * @param {string} logId
       * @param {function} cb
       */
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        const { fullFlow, triggerData } = execution
        const agentId = fullFlow.trigger.config.agent
        const webhook = triggerData.data

        const cmd = await filesLib.getOneAsString({ _id: currentStep.config.cmdFile })

        const commandSent = sendAgent(agentId, fullFlow, execution, logId, currentStep, 'tf.githubCi.run_cmd', {
          cmd,
          webhook,
          currentStep
        })
          
        cb(null, {
          result: {},
          next: false,
          error: !commandSent,
          msgs: [
            {
              m: commandSent ? 's-gh-ci.events.run_cmd.agent.sent.success' : 's-gh-ci.events.run_cmd.agent.sent.error',
              err: !commandSent,
              // p: callParameters,
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