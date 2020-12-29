const jwt = require('jsonwebtoken')
const Handlebars = require('handlebars')
const jwtSecret = require('/imports/download/server/secret')

let servicesAvailable = []
//calculateUsage
module.exports.servicesAvailable = servicesAvailable

/**
 * Determine what are a flow's capabilities.
 * 
 * @param {Object} flow 
 * 
 * @returns {Object} Object containing the execution capabilities. This are:
 *  runInOneGo: Determines if all the tasks for a flow can be executed 
 *              one after each other, instead of creating independent jobs queue
 *              taks.
 */
const flowCapabilities = flow => {
  let capabilities = {
    runInOneGo: true
  }

  let { steps } = flow

  if (!steps) steps = []

  steps.map(step => {
    const stepService = servicesAvailable.find(sa => sa.name === step.type)
    const stepEvent = stepService.events.find(sse => sse.name === step.event)
    if (!stepEvent) {
      capabilities.runInOneGo = false
      return
    }
    const stepCapabilities = stepEvent.capabilities || {}
    if (!stepCapabilities.runInOneGo) capabilities.runInOneGo = false
  })

  return capabilities
}

module.exports.flowCapabilities = flowCapabilities

const executeServiceHook = (service, hook, crud, stage, data, treat) => {
  if (!service) throw new Error('Service not specified')
  const returnableData = treat === 'original' ? data[0] : treat === 'new' ? data[1] : data[0]
  if (!service.hooks) return returnableData
  if (!service.hooks[hook]) return returnableData
  if (!service.hooks[hook][crud]) return returnableData
  if (!service.hooks[hook][crud][stage]) return returnableData
  return service.hooks[hook][crud][stage](data[0], data[1], treat)
}

// flow, delete, pre, [flow], original
const executeFlowHook = (service, hook, crud, stage, data, treat) => {
  if (!service) throw new Error('Service not specified')
  const returnableData = treat === 'original' ? data[0] : treat === 'new' ? data[1] : data[0]
  if (!service.hooks) return returnableData[hook]
  if (!service.hooks[hook]) return returnableData[hook]
  if (!service.hooks[hook][crud]) return returnableData[hook]
  if (!service.hooks[hook][crud][stage]) return returnableData[hook]
  return service.hooks[hook][crud][stage](data[0], data[1], treat)
}

const services = {
  create: {
    pre: (newService) => {
      let service = servicesAvailable.find(service => service.name === newService.type)
      if (!service) throw new Error('Service not found')

      return executeServiceHook(service, 'service', 'create', 'pre', [newService], 'original')
    },
    post: (newService) => {
      let service = servicesAvailable.find(service => service.name === newService.type)
      if (!service) throw new Error('Service not found')
      return executeServiceHook(service, 'service', 'create', 'post', [newService], 'original')
    }
  },
  update: {
    pre: (originalService, newService) => {
      let service = servicesAvailable.find(service => service.name === newService.type)
      if (!service) throw new Error('Service not found')
      return executeServiceHook(service, 'service', 'update', 'pre', [originalService, newService], 'new')
    },
    post: (originalService, newService) => {
      let service = servicesAvailable.find(service => service.name === newService.type)
      if (!service) throw new Error('Service not found')

      return executeServiceHook(service, 'service', 'update', 'post', [originalService, newService], 'new')
    }
  },
  delete: {
    pre: (toDelete) => {
      let service = servicesAvailable.find(service => service.name === toDelete.type)
      if (!service) throw new Error('Service not found')

      return executeServiceHook(service, 'service', 'delete', 'pre', [toDelete], 'original')
    },
    post: (deleted) => {
      let service = servicesAvailable.find(service => service.name === deleted.type)
      if (!service) throw new Error('Service not found')
      return executeServiceHook(service, 'service', 'delete', 'post', [deleted], 'original')
    }
  }
}

module.exports.services = services

const flows = {
  create: {
    pre: (newFlow) => {
      // Trigger hooks
      {
        let triggerService = servicesAvailable.find(service => service.name === newFlow.trigger.type)
        if (!triggerService) throw new Error('Service not found')
        newFlow.trigger = executeFlowHook(triggerService, 'trigger', 'create', 'pre', [newFlow], 'original')
      }

      // Trigger hooks
      // TODO: Steps hooks

      return newFlow
    },

    post: (newFlow) => {
      // Trigger hooks
      {
        let triggerService = servicesAvailable.find(service => service.name === newFlow.trigger.type)
        if (!triggerService) throw new Error('Service not found')
        newFlow.trigger = executeFlowHook(triggerService, 'trigger', 'create', 'post', [newFlow], 'original')
      }

      // TODO: Steps hooks

      return newFlow
    }
  },
  update: {
    pre: (originalFlow, newFlow) => {
      // Trigger hooks
      {
        // Old flow
        {
          let triggerService = servicesAvailable.find(service => service.name === originalFlow.trigger.type)
          if (!triggerService) throw new Error('Service not found')
          originalFlow.trigger = executeFlowHook(triggerService, 'trigger', 'update', 'pre', [originalFlow, newFlow], 'original')
        }

        // New flow
        {
          let triggerService = servicesAvailable.find(service => service.name === newFlow.trigger.type)
          if (!triggerService) throw new Error('Service not found')
          newFlow.trigger = executeFlowHook(triggerService, 'trigger', 'update', 'pre', [originalFlow, newFlow], 'new')
        }
      }
      
      return newFlow
    },
    post: (originalFlow, newFlow) => {
      // Trigger hooks
      {
        // Old flow
        {
          let triggerService = servicesAvailable.find(service => service.name === originalFlow.trigger.type)
          if (!triggerService) throw new Error('Service not found')
          originalFlow.trigger = executeFlowHook(triggerService, 'trigger', 'update', 'post', [originalFlow, newFlow], 'original')
        }

        // New flow
        {
          let triggerService = servicesAvailable.find(service => service.name === newFlow.trigger.type)
          if (!triggerService) throw new Error('Service not found')
          newFlow.trigger = executeFlowHook(triggerService, 'trigger', 'update', 'post', [originalFlow, newFlow], 'new')
        }
      }
      
      return newFlow
    }
  },
  delete: {
    pre: (flow) => {
      // Trigger hooks
      if (!flow.trigger) throw new Error('Service issue #flows.delete.pre')
      let triggerService = servicesAvailable.find(service => service.name === flow.trigger.type)
      if (!triggerService) throw new Error('Service not found')
      flow.trigger = executeFlowHook(triggerService, 'trigger', 'delete', 'pre', [flow], 'original')
      return flow
    },
    post: (flow) => {
      // Trigger hooks
      if (!flow.trigger) throw new Error('Service issue #flows.delete.post')
      let triggerService = servicesAvailable.find(service => service.name === flow.trigger.type)
      if (!triggerService) throw new Error('Service not found')
      flow.trigger = executeFlowHook(triggerService, 'trigger', 'delete', 'post', [flow], 'original')
      return flow
    }
  }
}

module.exports.flows = flows

/**
 * returns an array of all 'type' results
 * @param {array} executionLogs Original list of step results
 * @param {string} type Type of results to get
 */
const getResultsTypes = (executionLogs, type) => {
  let r = []

  executionLogs.map(executionLog => {
    if (executionLog.result && executionLog.result[type]) {
      let el = executionLog.result[type]
      let canProcess = false
      if (Array.isArray(el) && el.length) canProcess = true
      if (Object.keys(el).length) canProcess = true

      if (canProcess) r = r.concat(el)
    }
  })

  return r
}

module.exports.getResultsTypes = getResultsTypes

const executionResults = (execution, executionLogs, config) => {
  if (!config) config = {}

  let data = {
    tasks: {}
  }
  if (config.external) {
    executionLogs.map(log => {
      if (!log.result || !log.result.files) return;

      // let { _id, execution, flow, step, stepIndex, status, user, type, event, createdAt, updatedAt, result } = log
      let { _id, execution, flow, step, user, result } = log

      result.files.map(file => {
        let token = jwt.sign({
          exp: Math.floor(Date.now() / 1000) + (60 * 60),
          data: { _id, execution, flow, step, user, fileName: file.fileName, fieldName: file.fieldName }
        }, jwtSecret)
  
        file.url = `${process.env.ROOT_URL}/download?type=actionFile&token=${token}`
        delete file.data
      })
    })
  }
  else {
    executionLogs.map(log => {
      if (log.result.files) log.result.files.map(f => f.data = '...')
    })
  }
  executionLogs.map(el => {
    let { _id, id, stepIndex, type, event, createdAt, status, result, updatedAt } = el
    if (!id) id = stepIndex
    data.tasks[id] = { _id, stepIndex, type, event, createdAt, status, result, updatedAt }
  })
  return data
}
module.exports.executionResults = executionResults

module.exports.buildTemplate = (execution, executionLogs, string, config) => {
  if (!config) config = {}

  try {
    let data = executionResults(execution, executionLogs, config)
    return Handlebars.compile(string)(data)
  }
  catch (ex) {
    console.error(ex)
    return string
  }
}