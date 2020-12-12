import { Meteor } from 'meteor/meteor'
const Queue = Jobs
import { Random } from 'meteor/random'
import { check } from 'meteor/check'

import { Flows } from '/imports/modules/flows/both/collection'
import { Executions } from '/imports/modules/executions/both/collection'
import { ExecutionsLogs } from '/imports/modules/executionslogs/both/collection'

import { servicesAvailable } from '/imports/services/_root/server'

import { calledFrom, analyze, guessStepsWithoutPreceding } from '/imports/modules/flows/both/flow'

import { compareArrays } from '/imports/helpers/both/arrays'

const debug = require('debug')('tideflow:queue:core')

Queue.configure({
  disableDevelopmentMode: process.env.NODE_ENV !== 'development'
})

const endExecution = async (execution, status, trace) => {
  status = status || 'finished'
  debug(`End execution ${execution._id} with ${status} - ${trace || '-'}`)
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
 * Calculate the number of tasks to execute based on conditional steps.
 * 
 * For example, for the following flow:
 *
 *
 *    +-----+         +----+
 *    |  T  +-------->+    |
 *    +-----+         |    |     +-----+
 *                    | 2  +--T->+  3  |
 *    +-----+         |    |     +--+--+     +-----+
 *    |  0  +-------->+    +--v     |        |  5  |
 *    +-----+         +-+--+  |     v        +--+--+
 *                      ^     |  +--+--+        ^
 *    +-----+           |     |  |  4  |        |
 *    |  1  | +---------+     |  +-----+        |
 *    +-----+                 |                 |
 *                            +-------F---------+
 *
 *  if 2 is false (F) then the result is 4 [T, 0, 1, 5]
 *  if 2 is true (T) then the result if 5 [T, 0, 1, 3, 4]
 **/
const calculateNumberOfSteps = (flow, logs) => {
  let values = []
  flow.steps.map((step, index) => {
    let log = logs.find(log => log.stepIndex === index)
    let bridged = log.bridgedIndexes
    let isBridged = !!bridged.length

  })
}

module.exports.calculateNumberOfSteps = calculateNumberOfSteps

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
      let result = await workflowStart({ execution, user })

      return Promise.resolve({
        _id: executionId,
        capabilities: execution.capabilities,
        result
      })
    }

    // executionData now contains _id and createdAt
    jobs.run('workflow-start', { execution, user })

    return {
      _id: executionId,
      capabilities: execution.capabilities
    }
  })

  return Promise.all(executionCreated)
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
  const user = Meteor.users.findOne({_id:execution.user}, {
    fields: { services: false }
  })
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
    // Get the executed steps for the current execution ...
    const executedSteps = ExecutionsLogs.find({execution:executionId}, {
      fields: { stepIndex: true, 'result.pass': true }
    }).fetch()

    const analysis = analyze(flow, executedSteps)
    // and compare it against the number of steps in the executed flow (+ trigger).
    // If the number matches, flag the execution as finished
    if (analysis.completed) {
      endExecution(execution, null, '#4')
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
    
    jobs.run('workflow-step', {
      execution,
      currentStep: nextStepFull,
      user 
    })
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
          result: triggerData,
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
 * Given a flow, returns the list of tasks that only depends on the flow's trigger.
 * 
 * For the flow:
 * +--------------------+
 * | +-------+      +-+ |
 * | |Trigger|----->|0| |
 * | +-------+      +-+ |
 * |                    |
 * |    +-+    +-+      |
 * |    |1|--->|2|      |
 * |    +-+    +-+      |
 * +--------------------+
 * Result is [0]
 * 
 * @param {Object} flow 
 */
const guessTriggerSingleChilds = flow => {
  const listOfCalls = calledFrom(flow)
  let result = []
  Object.keys(listOfCalls).map(stepIndex => {
    if (compareArrays(listOfCalls[stepIndex], ['trigger'])) {
      result.push(parseInt(stepIndex))
    }
  })
  return result
}

module.exports.guessTriggerSingleChilds = guessTriggerSingleChilds

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
          id: 'trigger',
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
            result: triggerResult.result,
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
          endExecution(execution, 'error', 'triggerResult.error #1')
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
          endExecution(execution, null, '#5')
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
        if (instance.remove) instance.remove()
        return resolve(r)
      })

      .catch(ex => {
        if (!ex.completed) console.error(ex)
        if (instance.remove) instance.remove()
      })
  })
}
jobs.register('workflow-start', workflowStart)

/**
 * Executea a workflow's task (not the trigger)
 * 
 * @param {Object} jobData
 * @param {Object} jobData.execution
 * @param {Object} jobData.currentStep
 * @param {Object} jobData.user the user's db record - expect passwords & tokens
 */
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

    // Create the execution LOG in the database
    .then(async () => { 
      executionLog = {
        id: currentStep.id,
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
        console.error(JSON.stringify({executionLog, currentStep}, ' ', 2))
        endExecution(execution, 'error', 'ExecutionsLogs.insert #2')
        throw { completed: true, reason: 'executionlog-error', error: ex }
      }
    })

    /**
     * Get the list of previous tasks to this one, so that previous results so
     * that previous tasks results are available for the current task.
     */
    .then(() => { 
      let previous = previousStepsIndexes.length ? ExecutionsLogs.find({
        execution: execution._id,
        stepIndex: { $in: previousStepsIndexes }
      }, {
        sort: {
          createdAt: -1
        }
      }).fetch() : []

      // Take the step ids from bridge tasks

      let bridgedIndexes = []

      previous.filter(task => {
        if (task.bridgedIndexes) {
          bridgedIndexes = bridgedIndexes.concat(task.bridgedIndexes)
          console.log({bridgedIndexes})
        }
        return !task.bridgedIndexes || !task.bridgedIndexes.length
      })

      if (!bridgedIndexes.length) return previous

      let additional = ExecutionsLogs.find({
        execution: execution._id,
        stepIndex: { $in: bridgedIndexes }
      }, {
        sort: {
          createdAt: -1
        }
      }).fetch()

      return previous.concat(additional)
    })

    /**
     * Executes the current task and get the results back
     */
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

    /**
     * Given the task results, analyzes what to do with it. This
     * 
     * For example: store logs, continue or end the execution, change the flow
     * based on conditions, etc.
     */
    .then(async eventCallback => {
      debug(` ${currentStep.type}.${currentStep.event} => CALLBACK => `, eventCallback)
      //executionLog.result = eventCallback.result
      //executionLog.next = eventCallback.next

      let updateReq = {
        $set: {
          result: eventCallback.result,
          next: eventCallback.next
        }
      }

      if (eventCallback.bridgedIndexes) {
        updateReq.$set.bridgedIndexes = eventCallback.bridgedIndexes
      }
  
      /**
       * error indicates the task failed to execute. Therefore the execution of
       * the flow should be stopped
       */
      if (eventCallback.error) {
        updateReq.$set.status = 'error'
      }
  
      // next indicates that next tasks can be executed.
      if (eventCallback.next) {
        updateReq.$set.status = eventCallback.error ? 'error' : 'success'
      }
  
      // List of messages to be stored
      if (eventCallback.msgs) {
        //executionLog.msgs = eventCallback.msgs
        updateReq['$push'] = { msgs: { $each: eventCallback.msgs } }
      }

      ExecutionsLogs.update({_id: executionLog._id, execution: execution._id}, updateReq)

      // If there was an error, stop flow's execution here.
      if (eventCallback.error) {
        await endExecution(execution, 'error', 'eventCallback.error #3')
        throw { completed: true, reason: 'event-error', error: eventCallback.error }
      }

      // Change the execution behavior based on confitions
      if (currentStep.type === 'conditions') {
        const pass = eventCallback.result.pass.toString()
        currentStep.outputs = currentStep.outputs.filter(o => {
          return o.reason === `condition-${pass}`
        })
      }

      return eventCallback
    })

    /**
     * take decission on what to do next. For example: hold or continue with
     * futher tasks
     */
    .then(async eventCallback => {
      // The service asked the queue to don't keep working on the execution
      if (!eventCallback.next) throw { completed: true, reason: 'next' }

      // Does the current step have any output?
      const numberOfOutputs = (currentStep.outputs || []).length

      // If no, it could mean that we should stop the flow's execution
      if (!numberOfOutputs) {
        const executedSteps = ExecutionsLogs.find({execution:execution._id}, {
          fields: { stepIndex: true, 'result.pass': true }
        }).fetch()

        const analysis = analyze(flow, executedSteps)
        // console.log({analysis})
        if (analysis.completed) {
          endExecution(execution, null, '#6')
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

        // Build the input to be passed to the next workflow-step-execution
        const nextStepData = {
          execution,
          currentStep: nextStepFull,
          user
        }
        
        /**
         * Some flows can run in one-go. One-go means that tasks can be executed
         * one right after the other (without going thorugh the queue service).
         * 
         * This helps completing flow executions and getting their results much
         * faster.
         * 
         * But in order to to this, the system must be sure that all tasks that
         * are part or the workflow execution support this ability.
         */
        if (execution.capabilities.runInOneGo) {
          return await workflowStep(nextStepData)
        }

        /**
         * If the the execution does not supports one-go, then schedule the next
         * task to go through the queue service.
         */
        jobs.run('workflow-step', nextStepData)
      })

      return await Promise.all(allPromises)
    })

    // perform database operations and finish
    .then(r => {
      if (instance.remove) instance.remove() // reduce database usage impact
      return executionLog
    })

    .catch(ex => {
      if (!ex.completed) console.error(ex)
      if (instance.remove) instance.remove()
    })  
}

jobs.register('workflow-step', workflowStep)

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
    this.remove()
    return
  }

  Meteor.wrapAsync(cb => {
    stepEvent.executionFinished(user, execution, cb)
  })()

  this.remove()
})