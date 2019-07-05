import { Meteor } from 'meteor/meteor'

import * as tfQueue from '/imports/queue/server'

import { nextCronExecution } from './service'

import { Flows } from '/imports/modules/flows/both/collection.js'

import { triggerFlows } from '/imports/queue/server'

tfQueue.jobs.register('s-cron-runOne', function(job) {
  let instance = this
  const flow = Flows.findOne({_id:job.flowId})

  if (!flow) {
    console.error(`Flow not found ${job.flowId}`)
    instance.success()
    return
  }

  const user = Meteor.users.findOne({_id: flow.user}, {
    fields: { services: false }
  })
  const nextDate = nextCronExecution(flow, '5')
  
  triggerFlows(
    flow.trigger,
    user,
    null,
    [],
    [flow]
  )

  if (nextDate && flow.status === 'enabled') {
    instance.replicate({
      date: nextDate
    })
  }
  
  instance.success()
})