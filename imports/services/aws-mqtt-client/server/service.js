import { servicesAvailable } from '/imports/services/_root/server'

import { compare } from '/imports/helpers/both/compare'
import { subscribe, unSubscribe } from './clients'

const service = {
  name: 'aws-mqtt-client',
  humanName: 's-aws-mqtt-client.name',
  inputable: false,
  stepable: true,
  ownable: true,
  hooks: {
    service: {
      create: {},
      update: {
        /**
         * @param {object} originalService
         * @param {object} mewService
         * @param {string} treat What's the expected service to be returned.
         * Possile values are: "new", "original"
         */
        pre: (originalService, newService, treat) => {
          console.log('1')
          return treat === 'original' ? originalService : newService
        },

        /**
         * @param {object} originalService
         * @param {object} mewService
         * @param {string} treat What's the expected service to be returned.
         * Possile values are: "new", "original"
         */
        post: (originalService, newService, treat) => {
          console.log('2')
          return treat === 'original' ? originalService : newService
        }
      },

      delete: {
        /**
         * @param {object} service
         */
        pre: service => {
          console.log('3')
          return service
        },

        /**
         * @param {object} service
         */
        post: service => {
          console.log('4')
          return service
        }
      }
    },
    // step: {}

    // Hooks that involves triggers.
    // All hooks must return a trigger's object.
    trigger: {
      // Creating a new workflow
      create: {
        /**
         * @param {object} flow
         */
        pre: flow => { // before creating it
          console.log('trigger.create.pre')
          return flow.trigger
        },
        /**
         * @param {object} flow
         */
        post: flow => { // after it's created
          console.log('trigger.create.post')
          return flow.trigger
        }
      },

      // Updating an existing workflow
      update: {

        /**
         * @param {object} originalFlow
         * @param {object} mewFlow
         * @param {string} treat What's the expected trigger to be returned.
         * Possile values are: "new", "original"
         */
        pre: (originalFlow, newFlow, treat) => {

          // IDENTICAL TRIGGER
          if (
            compare(treat, 'new') &&
            compare(originalFlow.trigger, newFlow.trigger)
          ) {
            // The flow has changed its status (disabled / enabled)
            if (!compare(originalFlow.status, newFlow.status)) {

              const flowId = newFlow._id
              const clientId = newFlow.trigger._id
              const topic = (newFlow.trigger.config || {}).topic

              // DISABLE => ENABLE
              if (newFlow.status === 'enabled') {
                subscribe(clientId, flowId, topic)
              }

              // ENABLE => DISABLE
              else if (newFlow.status === 'disabled') {
                unSubscribe(clientId, flowId, topic)
              }
            }

            // No updated needed
            return newFlow.trigger
          }

          // mqtt => mqtt, WITH DIFFERENT SETUP
          else if (
            compare(treat, 'new') &&
            compare(originalFlow.trigger.type, newFlow.trigger.type, 'aws-mqtt-client') &&
            !compare(originalFlow.trigger.config.topic, newFlow.trigger.config.topic)
          ) {
            const flowId = newFlow._id
            const previousClient = originalFlow.trigger._id
            const newClient = newFlow.trigger._id
            const oldTopic = (originalFlow.trigger.config || {}).topic
            const newtopic = (newFlow.trigger.config || {}).topic

            unSubscribe(previousClient, flowId, oldTopic)

            // STATUS UPDATE
            if (!compare(originalFlow.status, newFlow.status)) {

              // DISABLE => ENABLE
              if (newFlow.status === 'enabled') {
                subscribe(newClient, flowId, newtopic)
              }

              // ENABLE => DISABLE
              else if (newFlow.status === 'disabled') {
                // Do nothing. Already unsubscribed
              }
            }

            // mqtt => mqtt, WITH DIFFERENT SETUP, AND STILL ENABLED
            else if (newFlow.status === 'enabled') {
              subscribe(newClient, flowId, newtopic)
            }

            // mqtt => mqtt, WITH DIFFERENT SETUP, AND STILL DISABLED
            else {
              // Keep disabled
            }
          } else if ( // Moving from non mqtt to mqtt
            !compare(originalFlow.trigger.type, 'aws-mqtt-client')
          ) {
            const flowId = newFlow._id
            const clientId = newFlow.trigger._id
            const topic = (newFlow.trigger.config || {}).topic
            subscribe(clientId, flowId, topic)
          } else if (
            !compare(newFlow.trigger.type, 'aws-mqtt-client') &&
            compare(originalFlow.trigger.type, 'aws-mqtt-client')
          ) {
            const flowId = newFlow._id
            const previousClient = originalFlow.trigger._id
            const oldTopic = (originalFlow.trigger.config || {}).topic
            unSubscribe(previousClient, flowId, oldTopic)
          }
          return treat === 'original' ? originalFlow.trigger : newFlow.trigger
        },

        /**
         * @param {object} originalFlow
         * @param {object} mewFlow
         * @param {string} treat What's the expected trigger to be returned.
         * Possile values are: "new", "original"
         */
        post: (originalFlow, newFlow, treat) => {
          return treat === 'original' ? originalFlow.trigger : newFlow.trigger
        }
      },
      delete: {
        /**
         * @param {object} flow
         */
        pre: flow => {
          return flow.trigger
        },

        /**
         * @param {object} flow
         */
        post: flow => {
          return flow.trigger
        }
      }
    }
  },
  templates: {},
  events: [
    {
      name: 'message',
      capabilities: {
        runInOneGo: true
      },
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        const lastData = executionLogs[0].stepResult

        console.log({lastData})

        cb(null, {
          result: lastData,
          next: true,
          msgs: [
            {
              m: 's-aws-mqtt-client.log.message',
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
