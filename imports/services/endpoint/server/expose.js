import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'

import { Flows } from '/imports/modules/flows/both/collection'
import { Executions } from '/imports/modules/executions/both/collection'
import { ExecutionsLogs } from '/imports/modules/executionslogs/both/collection'
import { exposeExecutionLogs } from '/imports/services/_root/server'

import { triggerFlows } from '/imports/queue/server'
Router.route('/service/endpoint/:uuid', async function () {
  const req = this.request
  const res = this.response
  const uuid = this.params.uuid
  
  const flow = Flows.findOne({
    status: 'enabled',
    'trigger.type': 'endpoint',
    'trigger.event': 'called',
    'trigger.config.endpoint': uuid
  })

  if (!flow) {
    res.writeHead(404)
    res.end()
    return
  }

  let user = Meteor.users.findOne({_id: flow.user}, {
    fields: { services: false }
  })

  if (!user) {
    res.writeHead(404)
    res.end()
    return
  }

  let result = {}

  if (req.body) result.data = req.body
  if (req.files) result.files = req.files

  if (!Object.keys(result).length) { return }

  let timedOut = false

  let timeout = Meteor.setTimeout(() => {
    timedOut = true
    res.end(JSON.stringify({
      status: 'queued'
    }))
  }, 10000)
  
  const triggeredExecutions = await triggerFlows(
    flow.trigger,
    user,
    null,
    result,
    [flow]
  )

  const firstExecution = triggeredExecutions[0]

  if (firstExecution && firstExecution.capabilities.runInOneGo) {
    const executionsLogs = ExecutionsLogs.find({
      execution: firstExecution._id
    }).fetch()

    const execution = Executions.findOne({_id: firstExecution._id})

    const result = exposeExecutionLogs(executionsLogs)
    if (!timedOut) {
      return res.end(JSON.stringify({
        status: execution.status,
        results: result
      }, ' ', 2))
    }
  }
  else {
    let callResult = await new Promise((resolve, reject) => {
      let attemptNumber = 0
      let intervalID = Meteor.setInterval(function () {
        let waitedResult = Executions.findOne({
          _id: firstExecution._id,
          status: { $ne: 'started' }
        })
        if (waitedResult || ++attemptNumber === 10) {
            Meteor.clearInterval(intervalID);
  
            const executionsLogs = ExecutionsLogs.find({
              execution: firstExecution._id
            }).fetch()
  
            const result = exposeExecutionLogs(executionsLogs)
  
            return waitedResult ? resolve({
              status: waitedResult.status,
              results: result
            }) : resolve(null)
        }
      }, 1000);
    })

    res.end(JSON.stringify(callResult ? callResult : {
      status: 'queued'
    }, ' ', 2))
  }

  Meteor.clearTimeout(timeout)

  if (!timedOut) res.end({ status: 'queued' })
}, {where: 'server'})