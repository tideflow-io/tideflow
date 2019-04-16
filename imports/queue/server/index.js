import { Meteor } from 'meteor/meteor'
import { Jobs as Queue } from 'meteor/msavin:sjobs'

import { Random } from 'meteor/random'
import { check } from 'meteor/check'

import { Flows } from '/imports/modules/flows/both/collection.js'

import { servicesAvailable } from '/imports/services/_root/server'

import * as serverEmailHelper from '/imports/helpers/server/emails'
import * as emailHelper from '/imports/helpers/both/emails'

import * as executions from './helpers/executions'
import * as executionsSteps from './helpers/executionsSteps'

/**
 * 
 */
const jobs = {

  /**
   * registers a job that can be executed later on
   */
  register: (name, method, options, cb) => {
    console.log(`jobs.register ${name}`)
    let jobs = {};
    jobs[name] = method;
    return Queue.register(jobs)
  },

  /**
   * 
   */
  create: (name, data, options) => {
    console.log(`jobs.create ${name}`)
    if (!data) data = {}
    return Queue.run(name, data, options)
  },

  run: (name, data, options) => {
    console.log(`jobs.run ${name}`)
    if (!data) data = {}
    return Queue.run(name, data, options)
  },

  schedule: (name, data, options) => {
    console.log(`jobs.schedule ${name}`)
    if (!data) data = {}
    if (!options.date) throw new Error('Schedule with no date')
    return Queue.run(name, data, options)
  },

  reschedule: (name, data, options) => {
    console.log(`jobs.reschedule ${name}`)
    if (!data) data = {}
    if (!options.date) throw new Error('Schedule with no date')

    const query = {
      name: 's-cron-runOne',
      state: 'pending'
    }
    Object.keys(data).map(p => {
      query[`arguments.${p}`] = data[p]
    })
    const job = Queue.collection.findOne(query)
    if (job) {
      Queue.reschedule(job._id, options)
    }
    else {
      Queue.run(name, data, options)
    }
  },

  deschedule: (name, data, options, reason) => {
    console.log(`jobs.deschedule ${name}`)
    const query = {
      name: 's-cron-runOne',
      state: 'pending'
    }
    Object.keys(data).map(p => {
      query[`arguments.${p}`] = data[p]
    })
    const job = Queue.collection.findOne(query)
    if (job) {
      Queue.cancel(job._id)
    }
  }
}

module.exports.jobs = jobs

/**
 * 
 * @param {Array} steps 
 * @param {Integer} index 
 */
const step = (steps, index) => {
  console.log(`step ${index}`)
  if (index === 'last') {
    return steps[steps.length - 1]
  }
  else if (index === 0) {
    return steps[0]
  }
  else if (index === 'previous') {
    return steps[0]
  }
  else if (parseInt(index)) {
    return steps[index]
  }
  else {
    throw new Error('Invalid step index')
  }
}

module.exports.step = step

/**
 * 
 * @param {*} steps 
 * @param {*} index 
 */
const stepData = (executionLogs, index) => {
  console.log(`stepData ${index}`)
  return step(executionLogs, index).stepResults
}

module.exports.stepData = stepData

const logUpdate = (executionId, logId, messages, set) => {
  return executionsSteps.update(executionId, logId, {
    $set: set || {},
    $push: {
      msgs: {
        $each: messages
      }
    }
  })
}

module.exports.logUpdate = logUpdate

/**
 * 
 * @param {*} service 
 * @param {*} user 
 * @param {*} flowsQuery 
 * @param {*} data [{type: String, data: {}}]
 * @param {*} flows
 */
const triggerFlows = (service, user, flowsQuery, originalTriggerData, flows) => {
  console.log(`triggerFlows`)

  // Security check
  if (user.services) {
    throw new Error('Security issue: user services attached on triggerFlows.')
  }

  let serviceWorker = servicesAvailable.find(serviceAvailable => serviceAvailable.name === service.type)
  if (!serviceWorker) throw new Error('Service not found @ triggerFlows #1')

  if (!flows) {
    if (typeof flowsQuery.status !== 'string') {
      flowsQuery.status = 'enabled'
    }
  
    if (typeof flowsQuery['trigger._id'] !== 'string') {
      throw new Error('No trigger ID to execute')
    }
  
    if (typeof flowsQuery['trigger.event'] !== 'string') {
      throw new Error('No trigger event to execute')
    }
  }

  (flows || Flows.find(flowsQuery)).map(flow => {
    let event = serviceWorker.events.find(e => e.name === flow.trigger.event)
    if (!event) {
      console.log('No service')
      return null
    }

    if (flow.emailOnTrigger) {
      jobs.run('workflow-execution-notify-email', user, flow)
    }

    flow.steps.map(step => {
      step._id = Random.id()
    })

    let executionId = executions.create(service, flow)

    jobs.run('workflow-start', {originalTriggerData, executionId})
  })
}

module.exports.triggerFlows = triggerFlows

const executeNextStep = (context) => {
  check(context, {
    flow: String,
    execution: String,
    log: String,
    step: String
  })

  const execution = executions.get({_id: context.execution})
  const flow = execution.fullFlow

  // Get current step position in the list
  const currentStepIndex = flow.steps.findIndex(s => s._id === context.step)
  const currentStep = flow.steps.find(s => s._id === context.step)

  const nextSteps = currentStep.outputs || []

  if (!nextSteps.length) return;

  nextSteps.map(nextStep => {
    jobs.run('workflow-step', {
      currentStep: nextStep,
      previousStepId: context.step,
      executionId: context.execution
    })
  })

  // TODO
  executions.end(context.execution)
}

module.exports.executeNextStep = executeNextStep

const executionError = (context) => {
  console.log('executionError')
  check(context, {
    flow: String,
    execution: String
  })
  executions.update({
    _id: context.execution,
    flow: context.flow
  }, {
    $set: {
      status: 'error'
    }
  })
}

module.exports.executionError = executionError

/**
 * workflow-start launches a flow execution
 **/
jobs.register('workflow-start', function(jobData) {
  let instance = this

  let lapseStart = new Date()

  let { originalTriggerData, executionId } = jobData

  if (!Array.isArray(originalTriggerData)) {
    originalTriggerData = []
    // throw new Error('Trying to trigger flows without an array of originalTriggerData')
  }

  const execution = executions.get({_id: executionId})

  if (execution.status === 'stopped') {
    instance.success()
    return
  }

  const flow = execution.fullFlow
  const service = execution.fullService
  const user = Meteor.users.findOne({_id:execution.user})

  let serviceWorker = servicesAvailable.find(serviceAvailable => serviceAvailable.name === service.type)
  if (!serviceWorker) throw new Error('Service not found @ triggerFlows #2')

  let event = serviceWorker.events.find(e => e.name === flow.trigger.event)
  if (!event) {
    instance.success()
    return null
  }

  let logId = executionsSteps.create({
    execution: executionId,
    type: flow.trigger.type,
    event: flow.trigger.event,
    flow: execution.flow,
    user: execution.user,
    step: 'trigger',
    msgs: [],
    createdAt: lapseStart,
    status: 'success'
    // stdout
    // stderr
  })

  let triggerEvent = Meteor.wrapAsync((cb) => {
    event.callback(
      service,
      flow,
      user,
      Object.assign(flow.trigger, service),
      [
        {
          stepResults: originalTriggerData,
          next: true
        }
      ],
      executionId,
      logId,
      cb
    )
  })

  let triggerResult = triggerEvent()

  {
    let updateReq = {
      $set: {
        stepResults: triggerResult.result,
        next: triggerResult.next
        // status: # already set
      }
    }
    if (triggerResult.msgs) {
      updateReq['$push'] = { msgs: { $each: triggerResult.msgs } }
    }
    executionsSteps.update(executionId, logId, updateReq)
  }

  if (!flow.steps || !flow.steps.length) {
    executions.end(executionId)
    instance.success()
    return
  }

  // Get and schedule steps without an input
  let targetedSteps = flow.trigger.outputs.map(o => o.id) || []
  const allSteps = flow.steps.map((s,i)=>i)
  flow.steps.map(s => targetedSteps = targetedSteps.concat(s.outputs.map(o => o.id) || []))
  const lists = [allSteps, targetedSteps]
  console.log(JSON.stringify(lists, ' ', 2))
  const cardsWithoutInbound = lists.reduce((a, b) => a.filter(c => !b.includes(c)))

  // Schedule excution of cards without preceding steps
  cardsWithoutInbound.map(stepId => {
    jobs.run('workflow-step', {currentStep: flow.steps[stepId], previousStepId: undefined, executionId})
  })

  // Schedule excution of cards connected from the trigger
  flow.trigger.outputs.map(step => {
    jobs.run('workflow-step', {currentStep: flow.steps[step.id], previousStepId: 'trigger', executionId})
  })
  
  instance.success()
})

jobs.register('workflow-step', function(jobData) {
  let lapseStart = new Date()

  let instance = this

  /**
   * @param {*} currentStep 
   * @param {String} previousStepId
   * @param {String} executionId 
   */
  let { currentStep, previousStepId, executionId } = jobData

  const execution = executions.get({_id: executionId})

  if (!execution) {
    throw new Error(`Execution ${executionId} not found`)
  }

  let logId = executionsSteps.create({
    execution: executionId,
    flow: execution.flow,
    user: execution.user,
    step: currentStep._id,
    type: currentStep.type,
    event: currentStep.event,
    msgs: [],
    createdAt: lapseStart
    // stdout
    // stderr
    // status
  })

  if (execution.status === 'stopped') {
    executionsSteps.update(executionId, logId, {
      $set: {
        status: 'stopped'
      }
    })
    instance.success()
    return
  }

  const flow = execution.fullFlow
  const service = execution.fullService
  const user = Meteor.users.findOne({_id:execution.user})
  const previousSteps = previousStepId ?
    [executionsSteps.get(executionId, previousStepId)] : 
    []

  let stepService = servicesAvailable.find(sa => sa.name === currentStep.type)
  let stepEvent = stepService.events.find(sse => sse.name === currentStep.event)
  if (!stepEvent || !stepEvent.callback) return null
  
  let callEvent = Meteor.wrapAsync((cb) => {
    stepEvent.callback(service, flow, user, currentStep, previousSteps, executionId, logId, cb)
  })

  let eventCallback = callEvent()

  eventCallback.result.map(r => {
    if (r.type === 'file') {

      if (!r.data.data) {
        console.error('File have no data attached')
        return
      }

      let getFile = Meteor.wrapAsync((cb) => {
        let bufferChunks = []
        if (Buffer.isBuffer(r.data.data)) {
          return cb(null, r.data.data)
        }
        r.data.data.on('readable', () => {
          // Store buffer chunk to array
          let i = r.data.data.read()
          if (!i) return
          bufferChunks.push(i)
        })
        r.data.data.on('end', () => {
          cb(null, Buffer.concat(bufferChunks))
        })
      })
      r.data.data = getFile()
    }
  })

  {
    let updateReq = {
      $set: {
        stepResults: eventCallback.result,
        status: eventCallback.error ? 'error' : 'success',
        next: eventCallback.next
      }
    }
    if (eventCallback.msgs) {
      updateReq['$push'] = { msgs: { $each: eventCallback.msgs } }
    }
    executionsSteps.update(executionId, logId, updateReq)
  }
  
  // The service asked the queue to inmediately execute the next step on the flow 
  if (eventCallback.next) {

    // Get current step position in the list
    const currentStepIndex = flow.steps.findIndex(s => s._id === currentStep._id)

    const nextSteps = currentStep.outputs || []

    if (!nextSteps.length) return;

    nextSteps.map(nextStep => {
      jobs.run('workflow-step', {
        currentStep: nextStep,
        previousStepId: currentStep._id,
        executionId
      })
    })

    // TODO
    // executions.end(executionId)
  }

  instance.success()
})

jobs.register('workflow-execution-notify-email', function(user, flow) {
  let instance = this

  console.log('workflow-execution-notify-email')

  const to = [emailHelper.userEmail(user)]

  const emailDetails = {
    config: {
      subject: i18n.__('flows.emailOnTrigger.subject', {name: flow.title}),
      text: i18n.__('flows.emailOnTrigger.text'),
    }
  }

  const tplVars = {
    title: i18n.__('flows.emailOnTrigger.title'),
    subtitle: i18n.__('flows.emailOnTrigger.subtitle', {name: flow.title}),
    message: i18n.__('flows.emailOnTrigger.message', {name: flow.title}),
    buttonLink: Meteor.absoluteUrl(`/flows/${flow._id}`),
    buttonText: i18n.__('flows.emailOnTrigger.butonText')
  }

  const emailData = serverEmailHelper.data(to, emailDetails, tplVars, 'flowEmailOnTriggered')

  serverEmailHelper.send(emailData)

  instance.success()
})
