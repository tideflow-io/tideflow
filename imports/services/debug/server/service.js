import { servicesAvailable } from '/imports/services/_root/server'

const executionCb = (cb, name) => {
  console.log({name})
  cb(null, {
    result: [{
      type: 'object',
      data: {
        a: 1
      }
    }],
    next: true,
    msgs: [
      {
        m: `s-debug.log.${name}`,
        p: [],
        d: new Date()
      }
    ]
  })
}

const service = {
  name: 'debug',
  inputable: false,
  stepable: true,
  ownable: false,
  events: [
    {
      name: 'e1',
      callback: (service, flow, user, currentStep, executionLogs, executionId, logId, cb) => 
        executionCb(cb, 'e1')
    },
    {
      name: 'e2',
      callback: (service, flow, user, currentStep, executionLogs, executionId, logId, cb) => 
        executionCb(cb, 'e2')
    },
    {
      name: 'e3',
      callback: (service, flow, user, currentStep, executionLogs, executionId, logId, cb) => 
        executionCb(cb, 'e3')
    },
    {
      name: 'e4',
      callback: (service, flow, user, currentStep, executionLogs, executionId, logId, cb) => 
        executionCb(cb, 'e4')
    },
    {
      name: 'e5',
      callback: (service, flow, user, currentStep, executionLogs, executionId, logId, cb) => 
        executionCb(cb, 'e5')
    },
    {
      name: 'e6',
      callback: (service, flow, user, currentStep, executionLogs, executionId, logId, cb) => 
        executionCb(cb, 'e6')
    },
    {
      name: 'e7',
      callback: (service, flow, user, currentStep, executionLogs, executionId, logId, cb) => 
        executionCb(cb, 'e7')
    },
    {
      name: 'e8',
      callback: (service, flow, user, currentStep, executionLogs, executionId, logId, cb) => 
        executionCb(cb, 'e8')
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)