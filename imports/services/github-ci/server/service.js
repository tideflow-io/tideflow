import { servicesAvailable } from '/imports/services/_root/server'

import { ioTo } from '/imports/services/agent/server/socket'

import { Services } from "/imports/modules/services/both/collection.js"

const uuidv4 = require('uuid/v4')

const sendAgent = (agentId, flow, executionId, logId, currentStep, topic, data) => {
  const agentDoc = agentId === 'any' ? 'any' : Services.findOne({_id: agentId})
  return ioTo(agentDoc, Object.assign( {
    flow: flow._id,
    execution: executionId,
    log: logId,
    step: currentStep._id
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
    // {
    //   name: 'pull_request',
    //   humanName: 's-gh-ci.events.pull_request.name',
    //   viewerTitle: 's-gh-ci.events.pull_request.viewer.title',
    //   inputable: true,
    //   stepable: false,
    //   callback: async (service, flow, triggerData, user, currentStep, executionLogs, executionId, logId, cb) => {
    //   const agent = currentStep.config.agent
    //   const commandSent = sendAgent(agent, flow, executionId, logId, currentStep, 'tf.githubCi.pullRequest', {
    //     triggerService: currentStep,
    //     webhook: executionLogs[0].stepResults[0].data
    //   })

    //   cb(null, {
    //     result: [],
    //     next: false,
    //     error: !commandSent,
    //     msgs: [
    //       {
    //         m: commandSent ? 's-gh-ci.events.pull_request.agent.sent.success' : 's-gh-ci.events.pull_request.agent.sent.error',
    //         err: !commandSent,
    //         d: new Date()
    //       }
    //     ]
    //   })
    // },
    {
      name: 'push',
      humanName: 's-gh-ci.events.push.name',
      viewerTitle: 's-gh-ci.events.push.viewer.title',
      inputable: true,
      stepable: false,
      callback: async (service, flow, triggerData, user, currentStep, executionLogs, executionId, logId, cb) => {
        const agentId = flow.trigger.config.agent
        const commandSent = sendAgent(agentId, flow, executionId, logId, currentStep, 'tf.githubCi.push', {
          triggerService: service,
          webhook: executionLogs[0].stepResults[0].data
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
      }
    },
    {
      name: 'test_cmd',
      humanName: 's-gh-ci.events.test_cmd.name',
      viewerTitle: 's-gh-ci.events.test_cmd.viewer.title',
      inputable: false,
      stepable: true,
      templates: {
        eventConfig: 'servicesGithubCiBasicStep'
      },
      
      /**
       * @param {object} service Flow's trigger, including secrets, etc.
       * @param {object} flow Full flow. The trigger doesn't include secrets, etc.
       * @param {array} triggerData Data which triggered the .
       * @param {object} user Flow's owner information, excluding password, services, etc. As in database 
       * @param {object} currentStep The flow's current step object
       * @param {array} executionLogs
       * @param {string} executionId
       * @param {string} logId
       * @param {function} cb
       */
      callback: async (service, flow, triggerData, user, currentStep, executionLogs, executionId, logId, cb) => {
        const agentId = flow.trigger.config.agent
        const cmd = currentStep.config.cmd
        const webhook = triggerData[0].data

        const commandSent = sendAgent(agentId, flow, executionId, logId, currentStep, 'tf.githubCi.test_cmd', {
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
              m: commandSent ? 's-gh-ci.events.test_cmd.agent.sent.success' : 's-gh-ci.events.test_cmd.agent.sent.error',
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