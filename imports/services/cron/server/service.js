import * as tfQueue from '/imports/queue/server'

import i18n from 'meteor/universe:i18n'

const cronConverter = require('cron-converter')

import { compare } from '/imports/helpers/both/compare'

import { servicesAvailable } from '/imports/services/_root/server'

const debug = console.log

/**
 * 
 * @param {*} value 
 */
const nextCronExecution = (flow) => {
  try {
    let schedule = new cronConverter()
      .fromString(flow.trigger.config.cron)
      .schedule()
    schedule.next()
    const delay = moment().add(1, 'minutes')
    if (schedule.date.isBefore(delay)) {
      return delay.toDate() // TODO this may contain delays
    }
    return schedule.date.toDate()
  } catch (ex) {
    debug({
      ex,
      d: flow.trigger.config.cron
    })
    return null
  }
}

module.exports.nextCronExecution = nextCronExecution

/**
 * 
 */
const service = {
  name: 'cron',
  humanName: i18n.__('s-cron.name'),
  inputable: true,
  stepable: false,
  ownable: false,
  hooks: {
    // channel: {},
    // step: {}
    trigger: {
      create: {
        pre: (flow) => {
          debug('Register new cron task in the server')
          if (flow.status === 'enabled') {
            const schedule = nextCronExecution(flow)
            if (!schedule) {
              flow.status = 'disabled'
            } else {
              tfQueue.jobs.schedule('s-cron-runOne', {
                flowId: flow._id
              }, {
                singular: true,
                date: schedule
              })
            }
          }
          return flow.trigger
        },
        post: (flow) => {
          return flow.trigger
        }
      },
      update: {
        pre: (originalFlow, newFlow, treat) => {

          // IDENTICAL TRIGGER
          if (
            compare(treat, 'new') &&
            compare(originalFlow.trigger, newFlow.trigger)
          ) {
            if (!compare(originalFlow.status, newFlow.status)) {

              // DISABLE => ENABLE
              if (newFlow.status === 'enabled') {
                const schedule = nextCronExecution(newFlow)
                if (!schedule) {
                  newFlow.status = 'disabled'
                  tfQueue.jobs.deschedule('s-cron-runOne', {
                      flowId: newFlow._id
                    },
                    'flow-disabled-wrong-date'
                  )
                } else {
                  tfQueue.jobs.schedule('s-cron-runOne', {
                    flowId: newFlow._id
                  }, {
                    singular: true,
                    date: schedule
                  })
                }
                debug('Enable #81')
              }

              // ENABLE => DISABLE
              else if (newFlow.status === 'disabled') {
                tfQueue.jobs.deschedule('s-cron-runOne', {
                    flowId: newFlow._id
                  }, {},
                  'flow-disabled'
                )
                debug('Disable')
              }
            }

            // No updated needed
            return newFlow.trigger
          }

          // CRON => CRON, WITH DIFFERENT SETUP
          else if (
            compare(treat, 'new') &&
            compare(originalFlow.trigger.type, newFlow.trigger.type, 'cron') &&
            !compare(originalFlow.trigger, newFlow.trigger)
          ) {

            // STATUS UPDATE
            if (!compare(originalFlow.status, newFlow.status)) {

              // DISABLE => ENABLE
              if (newFlow.status === 'enabled') {
                const schedule = nextCronExecution(newFlow)
                if (!schedule) {
                  newFlow.status = 'disabled'
                  tfQueue.jobs.deschedule('s-cron-runOne', {
                      flowId: newFlow._id
                    },
                    'flow-disabled-wrong-date'
                  )
                } else {
                  tfQueue.jobs.reschedule('s-cron-runOne', {
                    flowId: newFlow._id
                  }, {
                    singular: true,
                    date: schedule
                  })
                }
                debug('Enable #113') // Update the cron
              }

              // ENABLE => DISABLE
              else if (newFlow.status === 'disabled') {
                tfQueue.jobs.deschedule('s-cron-runOne', {
                    flowId: newFlow._id
                  },
                  'flow-disabled'
                )
                debug('Disable') // Update the cron
              }
            }

            // CRON => CRON, WITH DIFFERENT SETUP, AND STILL ENABLED
            else if (newFlow.status === 'enabled') {
              let schedule = nextCronExecution(newFlow)
              if (!schedule) {
                newFlow.status = 'disabled'
                tfQueue.jobs.deschedule('s-cron-runOne', {
                    flowId: newFlow._id
                  },
                  'flow-disabled-wrong-date'
                )
              } else {
                tfQueue.jobs.reschedule('s-cron-runOne', {
                  flowId: newFlow._id
                }, {
                  singular: true,
                  date: schedule
                })
              }
              debug('Update the cron')
            }

            // CRON => CRON, WITH DIFFERENT SETUP, AND STILL DISABLED
            else {
              // Keep disabled
            }
          } else if (
            compare(newFlow.trigger.type, 'cron') &&
            !compare(originalFlow.trigger.type, 'cron')
          ) {
            debug('Register new cron')
            let schedule = nextCronExecution(newFlow)
            tfQueue.jobs.schedule('s-cron-runOne', {
              flowId: newFlow._id
            }, {
              singular: true,
              date: schedule
            })
          } else if (
            !compare(newFlow.trigger.type, 'cron') &&
            compare(originalFlow.trigger.type, 'cron')
          ) {
            debug('Unregister old cron')
            tfQueue.jobs.deschedule('s-cron-runOne', {
              flowId: newFlow._id
            })
          }
          return treat === 'original' ? originalFlow.trigger : newFlow.trigger
        },
        post: (originalFlow, newFlow, treat) => {
          return treat === 'original' ? originalFlow.trigger : newFlow.trigger
        }
      },
      delete: {
        pre: (flow) => {
          debug('Un-Register new cron task in the server')
          return flow.trigger
        },
        post: (flow) => {
          return flow.trigger
        }
      }
    }
  },
  events: [{
    name: 'called',
    humanName: i18n.__('s-cron.events.called.name'),
    visibe: true,
    callback: (channel, flow, user, currentStep, executionLogs, executionId, logId, cb) => {
      cb(null, {
        result: [],
        next: true
      })
    },
    conditions: [
      // {}
    ]
  }]
}

module.exports.service = service

servicesAvailable.push(service)