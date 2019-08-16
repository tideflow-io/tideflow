import { servicesAvailable } from '/imports/services/_root/server'

import { ioTo } from '/imports/services/agent/server/socket'

import { Services } from "/imports/modules/services/both/collection.js"

const uuidv4 = require('uuid/v4')

const sendGithubWebhookToAgent = async (service, flow, user, triggerService, executionLogs, executionId, logId, cb) => {
  const agent = triggerService.config.agent
  const agentDoc = agent === 'any' ? 'any' : Services.findOne({_id: agent})
  const commandSent = ioTo(agentDoc, {
    flow: flow._id,
    execution: executionId,
    log: logId,
    triggerService,
    webhook: executionLogs[0].stepResults[0].data
  }, 's-gh-ci-pull_request')

  cb(null, {
    result: [],
    next: false,
    error: !commandSent,
    msgs: [
      {
        m: commandSent ? 's-gh-ci.events.pull_request.agent.sent.success' : 's-gh-ci.events.pull_request.agent.sent.error',
        err: !commandSent,
        // p: callParameters,
        d: new Date()
      }
    ]
  })
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
      callback: sendGithubWebhookToAgent
    },
    {
      name: 'push',
      humanName: 's-gh-ci.events.push.name',
      viewerTitle: 's-gh-ci.events.push.viewer.title',
      inputable: true,
      stepable: false,
      callback: sendGithubWebhookToAgent
    },
    {
      name: 'build_cmd',
      humanName: 's-gh-ci.events.build_cmd.name',
      viewerTitle: 's-gh-ci.events.build_cmd.viewer.title',
      inputable: false,
      stepable: true,
      templates: {
        eventConfig: 'servicesGithubCiBasicStep'
      },
      callback: async (service, flow, user, currentStep, executionLogs, executionId, logId, cb) => {
        const cmd = currentStep.config.cmd
        
      }
    },
    {
      name: 'deploy_cmd',
      humanName: 's-gh-ci.events.deploy_cmd.name',
      viewerTitle: 's-gh-ci.events.deploy_cmd.viewer.title',
      inputable: false,
      stepable: true,
      templates: {
        eventConfig: 'servicesGithubCiBasicStep'
      },
      callback: async (service, flow, user, currentStep, executionLogs, executionId, logId, cb) => {
        const cmd = currentStep.config.cmd
        
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)