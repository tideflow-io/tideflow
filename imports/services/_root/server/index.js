const os = require('os')
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')
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
      // Todo bien
      // TODO: Steps hooks
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
      // TODO: Steps hooks
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
      // TODO: Steps hooks
      return flow
    },
    post: (flow) => {
      // Trigger hooks
      if (!flow.trigger) throw new Error('Service issue #flows.delete.post')
      let triggerService = servicesAvailable.find(service => service.name === flow.trigger.type)
      if (!triggerService) throw new Error('Service not found')
      flow.trigger = executeFlowHook(triggerService, 'trigger', 'delete', 'post', [flow], 'original')
      // TODO: Steps hooks
      return flow
    }
  }
}

module.exports.flows = flows

/**
 * Given a set of executionLogs, return the data that can be publicly available
 * @param {Array} executionLogs 
 */
const exposeExecutionLogs = executionLogs => {
  executionLogs = processableResults(executionLogs, true)
  return executionLogs.map(el => {
    const { _id, type, event, stepIndex, status, createdAt, stepResult, updatedAt } = el
    return { _id, type, event, stepIndex, status, createdAt, stepResult, updatedAt }
  })
}

module.exports.exposeExecutionLogs = exposeExecutionLogs

/**
 * Given actions execution logs (as taken from the database) return them in a
 * format that can be passed to services like `code` or `agent`, so this
 * services get only the necessary data and that they can get.
 * 
 * For example, some workflow actions generate files. This files can then be
 * passed to other actions that can be either executed locally (in the same server
 * that is running Tideflow) or in external computers. 
 * 
 * This means that such files needs to be accesible externally. 
 * 
 * What this function does is to prepare files to they can be used locally and
 * externally.
 * 
 * @param {array} executionLogs 
 * @param {boolean} external Indicates if the service executing the workflow
 * action is running on an external system. This causes any files to be neede to
 * be returned as an URL that can be reached externally.
 */
const processableResults = (executionLogs, external) => {
  if (!executionLogs || !executionLogs.length) return []

  return (executionLogs || []).map(el => {
    let { _id, execution, flow, step, stepIndex, status, user, type, event, createdAt, updatedAt, stepResult } = el
    if (!external && stepResult.files) { // Store files locally
      stepResult.files.map(file => {
        const tmpFileName = `${os.tmpdir}${path.sep}${new Date().getTime()}-${stepResult.data.fileName}`
        fs.writeFileSync(tmpFileName, stepResult.data.data)
        file.path = tmpFileName
        delete file.data
      })
    }
    else if (external && stepResult.files) {
      stepResult.files.map(file => {
        let token = jwt.sign({
          exp: Math.floor(Date.now() / 1000) + (60 * 60),
          data: { _id, execution, flow, step, user, fileName: file.fileName, fieldName: file.fieldName }
        }, jwtSecret)
  
        file.url = `${process.env.ROOT_URL}download?type=actionFile&token=${token}`
        delete file.data
      })
    }
    return { _id, stepIndex, type, event, status, createdAt, updatedAt, stepResult }
  }) // external ? 'external' : 'internal'
}

module.exports.processableResults = processableResults

/**
 * returns an array of all 'type' results
 * @param {array} executionLogs Original list of step results
 * @param {string} type Type of results to get
 */
const getResultsTypes = (executionLogs, type) => {
  let r = []

  executionLogs.map(executionLog => {
    if (executionLog.stepResult && executionLog.stepResult[type]) {
      let el = executionLog.stepResult[type]
      let canProcess = false
      if (Array.isArray(el) && el.length) canProcess = true
      if (Object.keys(el).length) canProcess = true

      if (canProcess) r = r.concat(el)
    }
  })

  return r
}

module.exports.getResultsTypes = getResultsTypes