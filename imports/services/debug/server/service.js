import { servicesAvailable } from '/imports/services/_root/server'

const executionCb = (cb, executionLogs, name) => {
  console.log(JSON.stringify({executionLogs, name}, ' ', 2))
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
      callback: (user, currentStep, executionLogs, execution, logId, cb) => 
        executionCb(cb, executionLogs, 'e1')
    },
    {
      name: 'e2',
      callback: (user, currentStep, executionLogs, execution, logId, cb) => 
        executionCb(cb, executionLogs, 'e2')
    },
    {
      name: 'e3',
      callback: (user, currentStep, executionLogs, execution, logId, cb) => 
        executionCb(cb, executionLogs, 'e3')
    },
    {
      name: 'e4',
      callback: (user, currentStep, executionLogs, execution, logId, cb) => 
        executionCb(cb, executionLogs, 'e4')
    },
    {
      name: 'e5',
      callback: (user, currentStep, executionLogs, execution, logId, cb) => 
        executionCb(cb, executionLogs, 'e5')
    },
    {
      name: 'e6',
      callback: (user, currentStep, executionLogs, execution, logId, cb) => 
        executionCb(cb, executionLogs, 'e6')
    },
    {
      name: 'e7',
      callback: (user, currentStep, executionLogs, execution, logId, cb) => 
        executionCb(cb, executionLogs, 'e7')
    },
    {
      name: 'e8',
      callback: (user, currentStep, executionLogs, execution, logId, cb) => 
        executionCb(cb, executionLogs, 'e8')
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)