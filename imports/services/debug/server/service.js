import { servicesAvailable } from '/imports/services/_root/server'

const executionCb = (cb, executionLogs, name) => {
  cb(null, {
    result: {
      data: {
        name,
        random: Math.random()
      }
    },
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
      capabilities: {
        runInOneGo: true
      },
      callback: (user, currentStep, executionLogs, execution, logId, cb) => 
        executionCb(cb, executionLogs, 'e1')
    },
    {
      name: 'e2',
      capabilities: {
        runInOneGo: true
      },
      callback: (user, currentStep, executionLogs, execution, logId, cb) => 
        executionCb(cb, executionLogs, 'e2')
    },
    {
      name: 'e3',
      capabilities: {
        runInOneGo: true
      },
      callback: (user, currentStep, executionLogs, execution, logId, cb) => 
        executionCb(cb, executionLogs, 'e3')
    },
    {
      name: 'e4',
      capabilities: {
        runInOneGo: true
      },
      callback: (user, currentStep, executionLogs, execution, logId, cb) => 
        executionCb(cb, executionLogs, 'e4')
    },
    {
      name: 'e5',
      capabilities: {
        runInOneGo: true
      },
      callback: (user, currentStep, executionLogs, execution, logId, cb) => 
        executionCb(cb, executionLogs, 'e5')
    },
    {
      name: 'e6',
      capabilities: {
        runInOneGo: true
      },
      callback: (user, currentStep, executionLogs, execution, logId, cb) => 
        executionCb(cb, executionLogs, 'e6')
    },
    {
      name: 'e7',
      capabilities: {
        runInOneGo: true
      },
      callback: (user, currentStep, executionLogs, execution, logId, cb) => 
        executionCb(cb, executionLogs, 'e7')
    },
    {
      name: 'e8',
      capabilities: {
        runInOneGo: true
      },
      callback: (user, currentStep, executionLogs, execution, logId, cb) => 
        executionCb(cb, executionLogs, 'e8')
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)