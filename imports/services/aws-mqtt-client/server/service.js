import { servicesAvailable } from '/imports/services/_root/server'

import { instance as iotData } from './helpers/iotData'

const awsResponse = (err, data, success, cb) => {
  const lines = err ? [{
    m: err.message,
    err: true,
    p: [],
    d: new Date()
  }] : [{
    m: success,
    p: [],
    d: new Date()
  }]
  
  cb(null, {
    result: { data },
    error: !!err,
    next: true,
    msgs: lines
  })
}

const service = {
  name: 'aws-mqtt-client',
  humanName: 's-aws-mqtt-client.name',
  inputable: false,
  stepable: true,
  ownable: true,
  hooks: {
    // service: {},
    // step: {}

    // Hooks that involves triggers.
    // All hooks must return a trigger's object.
    trigger: {
      // Creating a new workflow
      create: {
        pre: flow => { // before creating it
          console.log('trigger.create.pre')
          return flow.trigger
        },
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

              // DISABLE => ENABLE
              if (newFlow.status === 'enabled') {
                console.log('TODO start client')
                // TODO start client
              }

              // ENABLE => DISABLE
              else if (newFlow.status === 'disabled') {
                console.log('TODO stop client')
                // TODO stop client
              }
            }

            // No updated needed
            return newFlow.trigger
          }

          // mqtt => mqtt, WITH DIFFERENT SETUP
          else if (
            compare(treat, 'new') &&
            compare(originalFlow.trigger.type, newFlow.trigger.type, 'aws-mqtt-client') &&
            !compare(originalFlow.trigger, newFlow.trigger)
          ) {

            // STATUS UPDATE
            if (!compare(originalFlow.status, newFlow.status)) {

              // DISABLE => ENABLE
              if (newFlow.status === 'enabled') {
                // TODO start client
                console.log('TODO start client')
              }

              // ENABLE => DISABLE
              else if (newFlow.status === 'disabled') {
                // TODO stop client
                console.log('TODO stop client')
              }
            }

            // mqtt => mqtt, WITH DIFFERENT SETUP, AND STILL ENABLED
            else if (newFlow.status === 'enabled') {
              // TODO update client
              console.log('TODO update client')
            }

            // mqtt => mqtt, WITH DIFFERENT SETUP, AND STILL DISABLED
            else {
              // Keep disabled
            }
          } else if ( // Moving from non mqtt to mqtt
            compare(newFlow.trigger.type, 'aws-mqtt-client') &&
            !compare(originalFlow.trigger.type, 'aws-mqtt-client')
          ) {
            // TODO start client
            console.log('TODO start client')
          } else if (
            !compare(newFlow.trigger.type, 'aws-mqtt-client') &&
            compare(originalFlow.trigger.type, 'aws-mqtt-client')
          ) {
            // TODO stop client
            console.log('TODO stop client')
          }
          return treat === 'original' ? originalFlow.trigger : newFlow.trigger
        },
        post: (originalFlow, newFlow, treat) => {
          return treat === 'original' ? originalFlow.trigger : newFlow.trigger
        }
      },
      delete: {
        pre: (flow) => {
          return flow.trigger
        },
        post: (flow) => {
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
