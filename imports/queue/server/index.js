import { Meteor } from 'meteor/meteor'
import i18n from 'meteor/universe:i18n'
import { Jobs as Queue } from 'meteor/msavin:sjobs'

import { Random } from 'meteor/random'
import { check } from 'meteor/check'

import { Flows } from '/imports/modules/flows/both/collection.js'
import { Executions } from '/imports/modules/executions/both/collection'
import { ExecutionsLogs } from '/imports/modules/executionslogs/both/collection'

import { servicesAvailable } from '/imports/services/_root/server'

import * as serverEmailHelper from '/imports/helpers/server/emails'
import * as emailHelper from '/imports/helpers/both/emails'

const debug = require('debug')('queue')

const endExecution = (_id, status) => {
  return Executions.update(
    { _id },
    { $set: { status: status || 'finished' } }
  )
}

/**
 * Returns the list steps indexes each step is called from.
 * 
 * +----------------------------+
 * | +-------+      +-+     +-+ |
 * | |Trigger|----->|0|  +->|4| |
 * | +-------+      +++  |  +-+ |
 * |                 |   |   ^  |
 * |                 v   |   |  |
 * |       +-+      +-   |  +-+ |
 * |       |2|----->|1|--+->|3| |
 * |       +-+      +-+     +-+ |
 * +----------------------------+
 * 
 * An example output is: 
 * 
 * {
 *  0: ['trigger']    // Step is 0 is called from the trigger
 *  1: [0, 2],        // Step 1 is called from 0 and 2
 *  3: [1],           // Step 3 is called from 1
 *  4: [1, 3]         // Step 4 is called from 1 and 3
 * }
 * 
 * The previous result example is for a flow like this:
 * 
 * {
 *  "trigger" : { "outputs" : [  { "stepIndex" : 0 } ] },
 *  "steps" : [
 *   { "outputs" : [ { "stepIndex" : 1 } ] },
 *   { "outputs" : [ { "stepIndex" : 3 }, { "stepIndex" : 4 } ] },
 *   { "outputs" : [ { "stepIndex" : 1 } ] },
 *   { "outputs" : [ { "stepIndex" : 4 } ] }
 *  ]
 * }
 * 
 * @param {*} flow 
 */
const calledFrom = flow => {
  let c = {} //

  const processOutputs = (outputs, index) => {
    (outputs || []).map(output => {
      let outputId = output.stepIndex
      if (!c[outputId]) c[outputId] = []
      c[outputId].push(index)
    })
  }

  flow.steps.map((step, index) => processOutputs(step.outputs, index))
  processOutputs(flow.trigger.outputs, 'trigger')

  return c
}

/**
 * 
 */
const jobs = {

  /**
   * registers a job that can be executed later on
   */
  register: (name, method, options, cb) => {
    debug(`jobs.register ${name}`)
    let jobs = {}
    jobs[name] = method
    return Queue.register(jobs)
  },

  /**
   * 
   */
  create: (name, data, options) => {
    debug(`jobs.create ${name}`)
    if (!data) data = {}
    return Queue.run(name, data, options)
  },

  run: (name, data, options) => {
    debug(`jobs.run ${name}`)
    if (!data) data = {}
    return Queue.run(name, data, options)
  },

  schedule: (name, data, options) => {
    debug(`jobs.schedule ${name}`)
    if (!data) data = {}
    if (!options.date) throw new Error('Schedule with no date')
    return Queue.run(name, data, options)
  },

  reschedule: (name, data, options) => {
    debug(`jobs.reschedule ${name}`)
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
    debug(`jobs.deschedule ${name}`)
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

const logUpdate = (execution, logId, messages, set) => {
  return ExecutionsLogs.update({_id: logId, execution}, {
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
 * Given a channel details, searches all flows using it as a trigger
 * 
 * @param {Object} service 
 * @param {Object} user 
 * @param {Object} flowsQuery 
 * @param {Array} data [{type: String, data: {}}]
 * @param {Array} flows
 */
const triggerFlows = (service, user, flowsQuery, originalTriggerData, flows) => {
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
      return null
    }

    if (flow.emailOnTrigger) {
      jobs.run('workflow-execution-notify-email', user, flow)
    }

    flow.steps.map(step => {
      step._id = Random.id()
    })

    let executionId = Executions.insert({
      user: flow.user,
      service: service._id ? service._id : null,
      fullService: service,
      flow: flow._id,
      fullFlow: flow,
      status: 'started'
    })

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

  const executionId = context.execution
  const execution = Executions.findOne({_id: executionId})
  const flow = execution.fullFlow
  const listOfCalls = calledFrom(flow)

  // If the execution was stopped, do not execute anything else
  if (execution.status === 'stopped') { return }

  // Get current step position in the list
  const currentStep = flow.steps.find(s => s._id === context.step)

  // Does the current step have any output?
  const outputs = currentStep.outputs || []

  // If no, it could mean that we should stop the flow's execution
  if (!outputs.length) {
    // Get the number of executed steps in the current execution ...
    const executedSteps = ExecutionsLogs.find({execution:executionId}).count()
    // and compare it against the number of steps in the executed flow (+ trigger).
    // If the number matches, flag the execution as finished
    if (executedSteps === flow.steps.length + 1) {
      endExecution(executionId)
    }
  }

  outputs.map(output => {
    const nextStepId = output.stepIndex
    const nextStepFull = flow.steps[nextStepId]

    // next step have multiple inputs?
    const stepInputsCount = listOfCalls[nextStepId] ? listOfCalls[nextStepId].length : 0

    if (stepInputsCount > 1) {
      const nextStepsCalledFrom = listOfCalls[nextStepId] || []

      // All previous steps are executed?
      const successSteps = ExecutionsLogs.find({
        execution: executionId,
        stepIndex: { $in: nextStepsCalledFrom },
        status: { $in: ['success'] }
      }).count()

      // If so, continue. Otherwise, don't do anything.
      if (successSteps !== nextStepsCalledFrom.length) return
    }

    // Schedule execution
    jobs.run('workflow-step', { currentStep: nextStepFull, executionId })
  })
}

module.exports.executeNextStep = executeNextStep

const executionError = (context) => {
  check(context, {
    flow: String,
    execution: String
  })
  Executions.update({
    _id: context.execution,
    flow: context.flow
  }, {
    $set: {
      status: 'error'
    }
  })
}

module.exports.executionError = executionError

const executeTrigger = (service, event, flow, user, originalTriggerData, execution, logId) => {
  return Meteor.wrapAsync((cb) => {
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
      execution._id,
      logId,
      cb
    )
  })()
}

/**
 * 
 * For the flow:
 * +--------------------+
 * | +-------+          |
 * | |Trigger|------v   |
 * | +-------+     +-+  |
 * |               |1|  |
 * |    +-+        +-+  |
 * |    |0|---------^   |
 * |    +-+             |
 * +--------------------+
 * 
 * @param {Object} flow 
 */
const guessStepsWithoutPreceding = (flow) => {
  // Build a list with all the steps indexes.
  // [0, 1]
  const allSteps = flow.steps.map((s,i)=>i);
  // List of steps indexes that are connected to the trigger
  // The result is [1]
  let triggerNextSteps = flow.trigger.outputs.map(o => o.stepIndex);
  // The result is [1, 1]
  flow.steps.map(flowStep => {
    triggerNextSteps = triggerNextSteps.concat(flowStep.outputs || []).map(output => output)
  });
  // The result is [ [0,1], [1,1] ]
  const lists = [allSteps, triggerNextSteps];
  // The result is [ 0 ]
  const cardsWithoutInbound = lists.reduce((a, b) => a.filter(c => !b.includes(c)));
  return cardsWithoutInbound || []
}

/**
 * 
 * For the flow:
 * +--------------------+
 * | +-------+      +-+ |
 * | |Trigger|----->|1| |
 * | +-------+      +-+ |
 * |                    |
 * |    +-+    +-+      |
 * |    |2|--->|3|      |
 * |    +-+    +-+      |
 * +--------------------+
 * Result is [1]
 * 
 * @param {Object} flow 
 */
const guessTriggerSingleChilds = (flow) => {
  const listOfCalls = calledFrom(flow)
  let result = []
  Object.keys(listOfCalls).map(stepIndex => {
    if (listOfCalls[stepIndex] === ['trigger']) {
      result.push(stepIndex)
    }
  })
  return result
}

/**
 * workflow-start launches a flow execution
 **/
jobs.register('workflow-start', function(jobData) {
  check(jobData, {
    originalTriggerData: Array,
    executionId: String,
  });

  let createdAt = new Date();

  if (!Array.isArray(jobData.originalTriggerData)) {
    jobData.originalTriggerData = [];
    // throw new Error('Trying to trigger flows without an array of originalTriggerData')
  }

  // Get the current execution
  const execution = Executions.findOne({_id: jobData.executionId});

  // If the execution is stopped, halt here and don't continue.
  if (execution.status === 'stopped') {
    return this.success();
  }

  const flow = execution.fullFlow;
  const service = execution.fullService;
  const user = Meteor.users.findOne({_id:execution.user}, {
    fields: { services: false }
  });

  // Service triggering the execution
  let serviceWorker = servicesAvailable.find(serviceAvailable => serviceAvailable.name === service.type);
  if (!serviceWorker) throw new Error('Service not found @ triggerFlows #2');

  // For the service triggering the execution, get the event
  let event = serviceWorker.events.find(e => e.name === flow.trigger.event);
  // Woop! The event triggered can't be found
  if (!event) {
    return this.success();
  }

  // Log the trigger execution
  let logId = ExecutionsLogs.insert({
    execution: execution._id,
    type: flow.trigger.type,
    event: flow.trigger.event,
    flow: execution.flow,
    user: execution.user,
    step: 'trigger',
    stepIndex: 'trigger',
    msgs: [],
    createdAt,
    status: 'success'
  });

  // Execute the actual trigger
  const triggerResult = executeTrigger(service, event, flow, user, jobData.originalTriggerData, execution, logId);

  // For the trigger log, update it with the results
  let stepUpdate = {
    $set: {
      stepResults: triggerResult.result,
      next: triggerResult.next
      // status: # already set
    }
  }
  if (triggerResult.msgs) {
    stepUpdate['$push'] = { msgs: { $each: triggerResult.msgs } };
  }
  ExecutionsLogs.update({
    _id: logId,
    execution: jobData.executionId
  }, stepUpdate);

  // Now that the trigger has been executed, we need to know which steps we
  // need to execute next. To do this
  // 
  // 1. Determine if there's anything to execute
  // 2. Determine the steps that don't have preceding steps
  // 3. Determine the steps that are directly conneted to the trigger, and DONT
  //    have any other preceding step.
  // 4. Launch

  // ===========================================================================
  // 1. Determine if there's anything to execute

  if (!flow.steps || !flow.steps.length) {
    endExecution(jobData.executionId);
    this.success();
    return;
  }

  // ===========================================================================
  // 2. Determine the steps that don't have preceding steps

  const stepsWithoutPreceding = guessStepsWithoutPreceding(flow)

  // ===========================================================================
  // 3. Determine the steps that are directly conneted to the trigger, and DONT
  //    have any other preceding step.
  const triggerSingleChilds = guessTriggerSingleChilds(flow)
  
  // ===========================================================================
  // 4. launch

  stepsWithoutPreceding.concat(triggerSingleChilds).map(stepIndex => {
    jobs.run('workflow-step', {
      currentStep: flow.steps[stepIndex],
      executionId: jobData.executionId
    })
  });

  this.success();
})

/**
 * Execute non-trigger flow step
 * 
 * @param {Object} jobData
 */
jobs.register('workflow-step', function(jobData) {
  let createdAt = new Date()

  let instance = this

  let { currentStep, executionId } = jobData

  const execution = Executions.findOne({_id: executionId})
  const flow = execution.fullFlow

  const currentStepIndex = currentStep ? flow.steps.findIndex(s => s._id === currentStep._id) : 'trigger'

  if (!execution) {
    throw new Error(`Execution ${executionId} not found`)
  }

  /**
   * Store execution in db.
   */
  let logId = ExecutionsLogs.insert({
    execution: executionId,
    flow: execution.flow,
    user: execution.user,
    step: currentStep._id,
    stepIndex: currentStepIndex,
    type: currentStep.type,
    event: currentStep.event,
    msgs: [],
    createdAt
    // stdout
    // stderr
    // status
  })

  // If the execution was stopped, do not execute anything else
  if (execution.status === 'stopped') {
    ExecutionsLogs.update({_id: logId, execution: executionId}, {
      $set: {
        status: 'stopped'
      }
    })
    instance.success()
    return
  }

  const listOfCalls = calledFrom(flow)
  const service = execution.fullService
  const user = Meteor.users.findOne({_id:execution.user}, {
    fields: { services: false }
  })

  const previousStepsIndexes = listOfCalls[currentStepIndex] || []
  const previousSteps = previousStepsIndexes.length ? ExecutionsLogs.find({
    execution: executionId,
    stepIndex: { $in: previousStepsIndexes }
  }, {
    sort: {
      createdAt: -1
    }
  }).fetch() : []

  const stepService = servicesAvailable.find(sa => sa.name === currentStep.type)
  const stepEvent = stepService.events.find(sse => sse.name === currentStep.event)
  if (!stepEvent || !stepEvent.callback) return null
  
  let eventCallback = Meteor.wrapAsync(cb => {
    stepEvent.callback(service, flow, user, currentStep, previousSteps, executionId, logId, cb)
  })()

  // Process files that may have been returned from the step execution
  eventCallback.result.map(r => {
    if (r.type !== 'file') return

    if (!r.data.data) {
      console.error('File have no data attached')
      return
    }

    let getFile = Meteor.wrapAsync((cb) => {
      let bufferChunks = []
      if (Buffer.isBuffer(r.data.data)) return cb(null, r.data.data)

      r.data.data.data.on('readable', () => {
        // Store buffer chunk to array
        let i = r.data.data.read()
        if (!i) return
        bufferChunks.push(i)
      })
      r.data.data.data.data.on('end', () => cb(null, Buffer.concat(bufferChunks)))
    })
    r.data.data = getFile()
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
    ExecutionsLogs.update({_id: logId, execution: executionId}, updateReq)
  }

  if (eventCallback.error) {
    endExecution(executionId, 'error')
    instance.success()
    return
  }
  
  // The service asked the queue to inmediately execute the next step on the flow 
  if (eventCallback.next) {

    // Does the current step have any output?
    const outputs = currentStep.outputs || []

    // If no, it could mean that we should stop the flow's execution
    if (!outputs.length) {
      // Get the number of executed steps in the current execution ...
      const executedSteps = ExecutionsLogs.find({execution:executionId}).count()
      // and compare it against the number of steps in the executed flow (+ trigger).
      // If the number matches, flag the execution as finished
      if (executedSteps === flow.steps.length + 1) {
        endExecution(executionId)
      }
    }

    outputs.map(output => {
      const nextStepId = output.stepIndex
      const nextStepFull = flow.steps[nextStepId]

      // next step have multiple inputs?
      const stepInputsCount = listOfCalls[nextStepId] ? listOfCalls[nextStepId].length : 0

      if (stepInputsCount > 1) {
        const nextStepsCalledFrom = listOfCalls[nextStepId]

        // All previous steps are executed?
        const successSteps = ExecutionsLogs.find({
          execution: executionId,
          stepIndex: { $in: nextStepsCalledFrom },
          status: { $in: ['success'] }
        }).count()

        // If so, continue. Otherwise, don't do anything.
        if (successSteps !== nextStepsCalledFrom.length) {
          instance.success()
          return
        }
      }

      // Schedule execution
      jobs.run('workflow-step', { currentStep: nextStepFull, executionId })
    })
  }

  instance.success()
})

jobs.register('workflow-execution-notify-email', function(user, flow) {
  let instance = this

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
