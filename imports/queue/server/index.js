import { Meteor } from 'meteor/meteor'
import i18n from 'meteor/universe:i18n'
import { Jobs as Queue } from './engine/api'

import { Random } from 'meteor/random'
import { check } from 'meteor/check'

import { Flows } from '/imports/modules/flows/both/collection.js'
import { Executions } from '/imports/modules/executions/both/collection'
import { ExecutionsLogs } from '/imports/modules/executionslogs/both/collection'

import { servicesAvailable } from '/imports/services/_root/server'

import * as serverEmailHelper from '/imports/helpers/server/emails'
import * as emailHelper from '/imports/helpers/both/emails'

const debug = require('debug')('tideflow:queue:core')

Queue.configure({
  // disableDevelopmentMode: true
})

const endExecution = async (execution, status) => {
  status = status || 'finished'
  debug(`End execution ${execution._id} with ${status}`)
  let now = new Date()
  let lapsed = (now.getTime() - execution.createdAt.getTime()) / 1000

  Executions.update(
    { _id: execution._id },
    { $set: {
      lapsed,
      status,
      ended: now
    } }
  )
  jobs.run('workflow-execution-finished', { execution, status })
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

module.exports.calledFrom = calledFrom

/**
 * 
 */
const jobs = {

  /**
   * registers a job that can be executed later on
   */
  register: (name, method, options, cb) => {
    debug(`+ REGISTER ${name}`)
    let jobs = {}
    jobs[name] = method
    return Queue.register(jobs)
  },

  /**
   * 
   */
  create: (name, data, options) => {
    debug(`+ CREATE ${name}`)
    if (!data) data = {}
    return Queue.run(name, data, options)
  },

  run: (name, data, options) => {
    debug(`+ RUN ${name}`)
    if (!data) data = {}
    return Queue.run(name, data, options)
  },

  schedule: (name, data, options) => {
    debug(`+ SCHEDULE ${name}`)
    if (!data) data = {}
    if (!options.date) throw new Error('Schedule with no date')
    return Queue.run(name, data, options)
  },

  reschedule: (name, data, options) => {
    debug(`+ RESCHEDULE ${name}`)
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
    debug(`+ DESCHEDULE ${name}`)
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
 * @param {Object} flow 
 * 
 * @returns {Object} Object containing the execution capabilities. This are:
 *  runInOneGo: Determines if all the tasks for a flow can be executed 
 *              one after each other, instead of creating independent jobs queue
 *              taks.
 */
const executionCapabilities = flow => {
  if (!flow) throw new Meteor.Error('no-flow')
  if (!flow.capabilities) flow.capabilities = {}

  let capabilities = {
    // Only run the tasks in one go, if we are totally confident that it's 
    // possible. 
    runInOneGo: flow.capabilities.runInOneGo === true
  }

  return capabilities
}

const executeFlowInOneGo = (execution, user) => {
  return workflowStart({ execution, user })
}

/**
 * Given a channel details, searches all flows using it as a trigger
 * 
 * @param {Object} service 
 * @param {Object} user 
 * @param {Object} flowsQuery 
 * @param {Array} data [{type: String, data: {}}]
 * @param {Array} flows
 */
const triggerFlows = async (service, user, flowsQuery, triggerData, flows) => {

  // Prevent user sensitive information leaks
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

  let executionCreated = (flows || Flows.find(flowsQuery).fetch()).map(async flow => {
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

    let execution = {
      team: flow.team,
      user: flow.user,
      triggerData,
      service: service._id ? service._id : null,
      fullService: service,
      flow: flow._id,
      fullFlow: flow,
      status: 'started'
    }

    execution.capabilities = executionCapabilities(flow)

    let executionId = Executions.insert(execution)

    if (execution.capabilities.runInOneGo) {
      let result = await executeFlowInOneGo(execution, user)

      return {
        _id: executionId,
        capabilities: execution.capabilities,
        result
      }
    }

    // executionData now contains _id and createdAt
    jobs.run('workflow-start', { execution, user })

    return {
      _id: executionId,
      capabilities: execution.capabilities
    }
  })

  return executionCreated
}

module.exports.triggerFlows = triggerFlows

const executeNextStep = (context) => {
  debug('executeNextStep')
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
  const currentStep = context.step === flow.trigger._id ? flow.trigger : flow.steps.find(s => s._id === context.step)

  // Does the current step have any output?
  const outputs = currentStep.outputs || []

  // If no, it could mean that we should stop the flow's execution
  if (!outputs.length) {
    // Get the number of executed steps in the current execution ...
    const executedSteps = ExecutionsLogs.find({execution:executionId}).count()
    // and compare it against the number of steps in the executed flow (+ trigger).
    // If the number matches, flag the execution as finished
    if (executedSteps === flow.steps.length + 1) {
      endExecution(execution)
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
    debug('executeNextStep is scheduling', nextStepFull.type)
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

const executeTrigger = (service, event, flow, user, triggerData, execution, logId) => {
  return Meteor.wrapAsync((cb) => {
    event.callback(
      user,
      flow.trigger,
      [
        {
          stepResult: triggerData,
          next: true
        }
      ],
      execution,
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
  const allSteps = flow.steps.map((s,i)=>i)
  // List of steps indexes that are connected to the trigger
  // The result is [1]
  let triggerNextSteps = flow.trigger.outputs.map(o => o.stepIndex)
  // The result is [1, 1]
  flow.steps.map(flowStep => {
    triggerNextSteps = triggerNextSteps.concat( (flowStep.outputs || []).map(s => s.stepIndex) )
  })
  // The result is [ [0,1], [1,1] ]
  const lists = [allSteps, triggerNextSteps]
  // The result is [ 0 ]
  const cardsWithoutInbound = lists.reduce((a, b) => a.filter(c => !b.includes(c)))
  return cardsWithoutInbound || []
}

/**
 * 
 * @param {*} arr1 
 * @param {*} arr2 
 */
const compareArrays = (arr1, arr2) => {
  return arr1.sort().join() === arr2.sort().join()
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
    if (compareArrays(listOfCalls[stepIndex], ['trigger'])) {
      result.push(stepIndex)
    }
  })
  return result
}

/**
 * workflow-start launches a flow execution
 **/
const workflowStart = function (jobData) {
  let instance = this

  check(jobData, {
    execution: Object,
    user: Object
  })

  debug(`workflow-start execution: ${jobData.execution._id}`)

  let createdAt = new Date()

  // Get the current execution
  const { execution, user } = jobData

  // Get needed execution data
  const triggerData = execution.triggerData
  const flow = execution.fullFlow
  const service = execution.fullService

  // The event for the service triggering the execution
  let event = null

  return new Promise((resolve, reject) => {
    Promise.resolve()
      .then(() => {
        // If the execution is stopped, halt here and don't continue.
        if (execution.status === 'stopped') 
          throw { completed: true, reason: 'stopped' }
      })

      .then(() => {
        // Service triggering the execution
        let serviceWorker = servicesAvailable.find(serviceAvailable => serviceAvailable.name === service.type)
        if (!serviceWorker) throw new Error('Service not found @ triggerFlows #2')

        // Stores the event for the service triggering the execution
        event = serviceWorker.events.find(e => e.name === flow.trigger.event)

        // Woop! The event triggered can't be found
        if (!event) throw { completed: true, reason: 'trigger-not-found' }
      })

      .then(() => {
        // Log the trigger execution
        let executionLog = {
          team: flow.team,
          execution: execution._id,
          type: flow.trigger.type,
          event: flow.trigger.event,
          flow: execution.flow,
          user: user._id,
          step: 'trigger',
          stepIndex: 'trigger',
          msgs: [],
          createdAt
        }
        
        ExecutionsLogs.insert(executionLog)

        return executionLog
      })

      .then(executionLog => {
        // Execute the actual trigger
        const triggerResult = executeTrigger(service, event, flow, user, triggerData, execution, executionLog._id)

        // For the trigger log, update it with the results
        let stepUpdate = {
          $set: {
            stepResult: triggerResult.result,
            next: triggerResult.next,
            status: triggerResult.next ? triggerResult.error ? 'error' : 'success' : 'pending'
          }
        }
        if (triggerResult.msgs) {
          stepUpdate['$push'] = { msgs: { $each: triggerResult.msgs } }
        }

        ExecutionsLogs.update({
          _id: executionLog._id,
          execution: execution._id
        }, stepUpdate)

        if (triggerResult.error) {
          endExecution(execution, 'error')
          debug('Trigger execution failed. Finishing')
          throw { completed: true, reason: 'trigger-execution-failed' }
        }

        if (!triggerResult.next) {
          debug('Trigger asked to wait before continue flow execution')
          throw { completed: true, reason: 'trigger-next-step' }
        }
      })

      .then(() => {
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
          debug('no flow steps')
          endExecution(execution)
          throw { completed: true, reason: 'flow-no-steps' }
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

        debug(`stepsWithoutPreceding ${JSON.stringify(stepsWithoutPreceding)}`)
        debug(`triggerSingleChilds ${JSON.stringify(triggerSingleChilds)}`)

        let runInOneGoPromises = []

        stepsWithoutPreceding.concat(triggerSingleChilds).map(stepIndex => {
          debug(`workflow-start triggered step [${flow.steps[stepIndex].type.toUpperCase()}]`)

          const nextStepData = {
            execution,
            currentStep: flow.steps[stepIndex],
            user
          }

          if (execution.capabilities.runInOneGo) {
            return runInOneGoPromises.push(
              workflowStep(nextStepData)
            )
          }

          return jobs.run('workflow-step', nextStepData)
        })

        if (execution.capabilities.runInOneGo && runInOneGoPromises.length) {
          return Promise.all(runInOneGoPromises)
        }
      })
      .then(r => {
        if (instance.success) instance.success()
        return resolve(r)
      })

      .catch(ex => {
        if (!ex.completed) console.error(ex)
        if (instance.success) instance.success()
      })
  })
}
jobs.register('workflow-start', workflowStart)

const workflowStep = function(jobData) {
  debug(`workflow-step execution: ${jobData.execution._id}`)

  let createdAt = new Date()
  let instance = this
  
  let { currentStep, user, execution } = jobData
  const flow = execution.fullFlow
  const currentStepIndex = currentStep ? flow.steps.findIndex(s => s._id === currentStep._id) : 'trigger'
  const listOfCalls = calledFrom(flow)
  const previousStepsIndexes = listOfCalls[currentStepIndex] || []

  let isStopped = Executions.find({
    _id: execution._id,
    status: { $ne: 'started' }
  }).count()

  let executionLog = null

  return Promise.resolve()
    .then(async () => { // Store log in database
      executionLog = {
        team: flow.team,
        execution: execution._id,
        flow: execution.flow,
        user: user._id,
        step: currentStep._id,
        stepIndex: currentStepIndex,
        type: currentStep.type,
        event: currentStep.event,
        msgs: [],
        createdAt
        // stdout
        // stderr
        // status
      }

      if (isStopped) {
        debug('  Stopping step due stopped status')
        executionLog.status = 'stopped'
        ExecutionsLogs.insert(executionLog)
        throw { completed: true, reason: 'execution-stopped' }
      }
    
      try {
        ExecutionsLogs.insert(executionLog)
      }
      catch (ex) {
        endExecution(execution, 'error')
        throw { completed: true, reason: 'executionlog-error', error: ex }
      }
    })

    // Get the list of previous tasks to this one
    .then(() => { 
      return previousStepsIndexes.length ? ExecutionsLogs.find({
        execution: execution._id,
        stepIndex: { $in: previousStepsIndexes }
      }, {
        sort: {
          createdAt: -1
        }
      }).fetch() : []
    })

    .then(async previousSteps => {
      const stepService = servicesAvailable.find(sa => sa.name === currentStep.type)
      const stepEvent = stepService.events.find(sse => sse.name === currentStep.event)
      if (!stepEvent || !stepEvent.callback) throw { completed: true, reason: 'stepEvent-not-found' }
      
      debug(` ${currentStep.type}.${currentStep.event} => ${executionLog._id}`)
    
      let eventCallback = null
    
      try {
        debug(` ${currentStep.type}.${currentStep.event} => CALLING CALLBACK`)
        eventCallback = await Meteor.wrapAsync(cb => {
          stepEvent.callback(user, currentStep, previousSteps, execution, executionLog._id, cb)
        })()
      }
      catch (ex) {
        console.error(ex)
      }
      finally {
        return eventCallback
      }
    })

    .then(async eventCallback => {
      debug(` ${currentStep.type}.${currentStep.event} => CALLBACK => `, eventCallback)
      //executionLog.stepResult = eventCallback.result
      //executionLog.next = eventCallback.next

      let updateReq = {
        $set: {
          stepResult: eventCallback.result,
          next: eventCallback.next
        }
      }
  
      if (eventCallback.error) {
        //executionLog.status = 'error'
        updateReq.$set.status = 'error'
      }
  
      if (eventCallback.next) {
        //executionLog.status = eventCallback.error ? 'error' : 'success'
        updateReq.$set.status = eventCallback.error ? 'error' : 'success'
      }
  
      if (eventCallback.msgs) {
        //executionLog.msgs = eventCallback.msgs
        updateReq['$push'] = { msgs: { $each: eventCallback.msgs } }
      }
      ExecutionsLogs.update({_id: executionLog._id, execution: execution._id}, updateReq)

      if (eventCallback.error) {
        await endExecution(execution, 'error')
        throw { completed: true, reason: 'event-error', error: eventCallback.error }
      }

      return eventCallback
    })

    .then(async eventCallback => {
      // The service asked the queue to don't keep working on the execution
      if (!eventCallback.next) throw { completed: true, reason: 'next' }

      // Does the current step have any output?
      const numberOfOutputs = (currentStep.outputs || []).length

      // If no, it could mean that we should stop the flow's execution
      if (!numberOfOutputs) {
        // Get the number of executed steps in the current execution ...
        const executedSteps = ExecutionsLogs.find({execution:execution._id}).count()

        // if (currentStep.type === 'debug')
        // console.log({executedSteps, length: flow.steps.length})

        // and compare it against the number of steps in the executed flow (+ trigger).
        // If the number matches, flag the execution as finished
        if (executedSteps === flow.steps.length + 1) {
          endExecution(execution)
        }
      }

      let allPromises = currentStep.outputs.map(async output => {
        const nextStepId = output.stepIndex
        const nextStepFull = flow.steps[nextStepId]

        // next step have multiple inputs?
        const stepInputsCount = listOfCalls[nextStepId] ? listOfCalls[nextStepId].length : 0

        if (stepInputsCount > 1) {
          const nextStepsCalledFrom = listOfCalls[nextStepId]

          // All previous steps are executed?
          const successSteps = ExecutionsLogs.find({
            execution: execution._id,
            stepIndex: { $in: nextStepsCalledFrom },
            status: { $in: ['success'] }
          }).count()

          // If so, continue. Otherwise, don't do anything.
          if (successSteps !== nextStepsCalledFrom.length) {
            throw { completed: true }
          }
        }

        const nextStepData = {
          execution,
          currentStep: nextStepFull,
          user
        }
        
        if (execution.capabilities.runInOneGo) {
          return await workflowStep(nextStepData)
        }
        // Schedule execution
        jobs.run('workflow-step', nextStepData)
      })

      return await Promise.all(allPromises)
    })

    .then(r => {
      if (instance.success) instance.success()
      // return Object.assign(executionLog, { subSteps: r })
      return executionLog
    })

    .catch(ex => {
      if (!ex.completed) console.error(ex)
      if (instance.success) instance.success()
    })  
}

/**
 * Execute non-trigger flow step
 * 
 * @param {Object} jobData
 */
jobs.register('workflow-step', workflowStep)

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

jobs.register('workflow-execution-finished', function(jobData) {
  let { execution } = jobData

  const user = Meteor.users.findOne({_id:execution.user}, {
    fields: { services: false }
  })

  // Determine if the workflow's trigger has a method to be executed when
  // an execution ends.
  const trigger = execution.fullFlow.trigger
  const stepService = servicesAvailable.find(sa => sa.name === trigger.type)
  const stepEvent = stepService.events.find(sse => sse.name === trigger.event)

  if (!stepEvent || !stepEvent.executionFinished) {
    this.success()
    return
  }

  Meteor.wrapAsync(cb => {
    stepEvent.executionFinished(user, execution, cb)
  })()

  this.success()
})