import i18n from 'meteor/universe:i18n'

import { Channels } from "/imports/modules/channels/both/collection.js"

import { servicesAvailable } from '/imports/services/_root/server'

import { stepData } from '/imports/queue/server'

import { ioTo } from './socket'

const uuidv4 = require('uuid/v4')

const service = {
  name: 'agent',
  humanName: i18n.__('s-agent.name'),
  inputable: false,
  stepable: true,
  ownable: true,
  templates: {
    detailsView: 'servicesAgentDetailsView',
    createMini: 'servicesAgentCreateMini',
    createFormPre: 'servicesAgentCreateFormPre',
    updateFormPre: 'servicesAgentUpdateFormPre'
  },
  hooks: {
    // step: {},
    // trigger: {}
    channel: {
      create: {
        pre: (channel) => {
          return Object.assign(channel, {
            config: { token: uuidv4() }
          }) 
        }
      },
      delete: {
        pre: (channel) => {
          return channel
        }
      }
    }
  },
  events: [
    {
      name: 'execute',
      humanName: i18n.__('s-agent.events.command.name'),
      visibe: true,
      callback: (channel, flow, user, currentStep, executionLogs, executionId, logId) => {
        const attachPrevious = (currentStep.config.inputLast || '') === 'yes'
        const lastData = stepData(executionLogs, 'last')

        const agent = currentStep.config.agent

        let agentDoc

        if (agent === 'any') {
          agentDoc = agent
        }
        else {
          agentDoc = Channels.findOne({_id: agent})
        }

        let commandSent = ioTo(agentDoc, {
          flow: flow._id,
          execution: executionId,
          log: logId,
          step: currentStep._id,
          command: currentStep.config.command,
          previous: attachPrevious ? JSON.stringify(lastData) : null
        })

        let callParameters = [currentStep.config.command]

        if (agentDoc) {
          callParameters.push(agentDoc._id || agentDoc)
        }
        
        return {
          result: [],
          next: false,
          error: !commandSent,
          msgs: [
            {
              m: commandSent ? 's-agent.log.execute_sent' : 's-agent.log.execute_notsent',
              err: !commandSent,
              p: callParameters,
              d: new Date()
            }
          ]
        }
      },
      conditions: [
        // {}
      ]
    },
    /*{
      name: 'nodejs',
      humanName: i18n.__('s-agent.events.nodejs.name'),
      visibe: true,
      callback: () => {},
      conditions: [
        // {}
      ]
    }*/
  ]
}

module.exports.service = service

servicesAvailable.push(service)