import { servicesAvailable } from '/imports/services/_root/server'

import { ioTo } from '/imports/services/agent/server/socket'

import { Services } from '/imports/modules/services/both/collection.js'
import { Executions } from '/imports/modules/executions/both/collection.js'

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
       * @param {object} service Flow's original trigger service, including secrets, etc.
       * @param {object} flow Full flow. The trigger doesn't include secrets, etc.
       * @param {object} user Flow's owner information, excluding password, services, etc. As in database 
       * @param {object} currentStep The flow's current step object
       * @param {array} executionLogs
       * @param {object} execution
       * @param {string} logId
       * @param {function} cb
       */
      callback: async (service, flow, user, currentStep, executionLogs, execution, logId, cb) => {
        const agent = currentStep.config.agent
        const webhook = execution.triggerData.data

        const commandSent = sendAgent(agent, flow, execution, logId, currentStep, 'tf.githubCi.pullRequest', {
          triggerService: currentStep,
          webhook
        })

        cb(null, {
          result: [],
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

      executionFinished: async (service, flow, user, execution, cb) => {
        const commandSent = sendAgent(flow.trigger.config.agent, flow, execution, null, null, 'tf.githubCi.pullRequest.execution.finished', {})
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
       * @param {object} service Flow's original trigger service, including secrets, etc.
       * @param {object} flow Full flow. The trigger doesn't include secrets, etc.
       * @param {object} user Flow's owner information, excluding password, services, etc. As in database 
       * @param {object} currentStep The flow's current step object
       * @param {array} executionLogs
       * @param {object} execution
       * @param {string} logId
       * @param {function} cb
       */
      callback: async (service, flow, user, currentStep, executionLogs, execution, logId, cb) => {
        const agentId = flow.trigger.config.agent
        const webhook = execution.triggerData.data
        const commandSent = sendAgent(agentId, flow, execution, logId, currentStep, 'tf.githubCi.push', {
          triggerService: service,
          webhook
        })

        cb(null, {
          result: [],
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

      executionFinished: async (service, flow, user, execution, cb) => {
        const agentId = flow.trigger.config.agent
        const commandSent = sendAgent(agentId, flow, execution, null, null, 'tf.githubCi.push.execution.finished', {})
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
       * @param {object} service Flow's original trigger service, including secrets, etc.
       * @param {object} flow Full flow. The trigger doesn't include secrets, etc.
       * @param {object} user Flow's owner information, excluding password, services, etc. As in database 
       * @param {object} currentStep The flow's current step object
       * @param {array} executionLogs
       * @param {object} execution
       * @param {string} logId
       * @param {function} cb
       */
      callback: async (service, flow, user, currentStep, executionLogs, execution, logId, cb) => {
        const webhook = execution.triggerData.data

        const agentId = flow.trigger.config.agent
        const commandSent = sendAgent(agentId, flow, execution, logId, currentStep, 'tf.githubCi.checksuite', {
          triggerService: service,
          webhook
        })

        if (commandSent) {
          let checkRun = await createCheckrun(service, webhook, execution, 'in_progress')
          Executions.update(
            { _id: execution._id },
            { $set: {
              'extras.checkRun': checkRun.data
            } }
          )
        }

        cb(null, {
          result: [],
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

      executionFinished: async (service, flow, user, execution, cb) => {
        const webhook = execution.triggerData.data
        const checkRun = execution.extras.checkRun
        const commandSent = sendAgent(flow.trigger.config.agent, flow, execution, null, null, 'tf.githubCi.checksuite.execution.finished', {})
        await updateCheckrun(service, webhook, checkRun, 'completed', 'success')
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
       * @param {object} service Flow's original trigger service, including secrets, etc.
       * @param {object} flow Full flow. The trigger doesn't include secrets, etc.
       * @param {object} user Flow's owner information, excluding password, services, etc. As in database 
       * @param {object} currentStep The flow's current step object
       * @param {array} executionLogs
       * @param {object} execution
       * @param {string} logId
       * @param {function} cb
       */
      callback: async (service, flow, user, currentStep, executionLogs, execution, logId, cb) => {
        const agentId = flow.trigger.config.agent
        const cmd = currentStep.config.cmd
        const webhook = execution.triggerData.data

        const commandSent = sendAgent(agentId, flow, execution, logId, currentStep, 'tf.githubCi.run_cmd', {
          cmd,
          webhook,
          currentStep
        })
          
        cb(null, {
          result: [],
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