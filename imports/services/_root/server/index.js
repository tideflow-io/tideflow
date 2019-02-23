const debug = console.log

let servicesAvailable = []
//calculateUsage
module.exports.servicesAvailable = servicesAvailable

const executeChannelHook = (service, hook, crud, stage, data, treat) => {
  if (!service) throw new Error('Service not specified')
  const returnableData = treat === 'original' ? data[0] : treat === 'new' ? data[1] : data[0]
  if (!service.hooks) return returnableData
  if (!service.hooks[hook]) return returnableData
  if (!service.hooks[hook][crud]) return returnableData
  if (!service.hooks[hook][crud][stage]) return returnableData
  return service.hooks[hook][crud][stage](data[0], data[1], treat)
}

const executeFlowHook = (service, hook, crud, stage, data, treat) => {
  if (!service) throw new Error('Service not specified')
  const returnableData = treat === 'original' ? data[0] : treat === 'new' ? data[1] : data[0]
  if (!service.hooks) return returnableData[hook]
  if (!service.hooks[hook]) return returnableData[hook]
  if (!service.hooks[hook][crud]) return returnableData[hook]
  if (!service.hooks[hook][crud][stage]) return returnableData[hook]
  return service.hooks[hook][crud][stage](data[0], data[1], treat)
}

const channels = {
  create: {
    pre: (newChannel) => {
      let service = servicesAvailable.find(service => service.name === newChannel.type)
      if (!service) throw new Error('Service not found')

      return executeChannelHook(service, 'channel', 'create', 'pre', [newChannel], 'original')
    },
    post: (newChannel) => {
      let service = servicesAvailable.find(service => service.name === newChannel.type)
      if (!service) throw new Error('Service not found')
      return executeChannelHook(service, 'channel', 'create', 'post', [newChannel], 'original')
    }
  },
  update: {
    pre: (originalChannel, newChannel) => {
      let service = servicesAvailable.find(service => service.name === newChannel.type)
      if (!service) throw new Error('Service not found')
      return executeChannelHook(service, 'channel', 'update', 'pre', [originalChannel, newChannel], 'new')
    },
    post: (originalChannel, newChannel) => {
      let service = servicesAvailable.find(service => service.name === newChannel.type)
      if (!service) throw new Error('Service not found')

      return executeChannelHook(service, 'channel', 'update', 'post', [originalChannel, newChannel], 'new')
    }
  },
  delete: {
    pre: (toDelete) => {
      let service = servicesAvailable.find(service => service.name === toDelete.type)
      if (!service) throw new Error('Service not found')

      return executeChannelHook(service, 'channel', 'delete', 'pre', [toDelete], 'original')
    },
    post: (deleted) => {
      let service = servicesAvailable.find(service => service.name === deleted.type)
      if (!service) throw new Error('Service not found')
      return executeChannelHook(service, 'channel', 'delete', 'post', [deleted], 'original')
    }
  }
}

module.exports.channels = channels

const flows = {
  create: {
    pre: (newFlow) => {
      debug('flows.create.pre')
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
      debug('flows.create.post')

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
      debug('flows.update.pre')

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
      debug('flows.update.post')

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
      debug('flows.delete.pre')

      // Trigger hooks
      if (!flow.trigger) throw new Error('Service issue #flows.delete.pre')
      let triggerService = servicesAvailable.find(service => service.name === flow.trigger.type)
      if (!triggerService) throw new Error('Service not found')
      flow.trigger = executeFlowHook(triggerService, 'flow', 'delete', 'pre', [flow], 'original')
      // TODO: Steps hooks
      return flow
    },
    post: (flow) => {
      debug('flows.delete.post')

      // Trigger hooks
      if (!flow.trigger) throw new Error('Service issue #flows.delete.post')
      let triggerService = servicesAvailable.find(service => service.name === flow.trigger.type)
      if (!triggerService) throw new Error('Service not found')
      flow.trigger = executeFlowHook(triggerService, 'flow', 'delete', 'post', [flow], 'original')
      // TODO: Steps hooks
      return flow
    }
  }
}

module.exports.flows = flows
