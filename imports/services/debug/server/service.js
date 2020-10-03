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
      callback: (user, currentStep, executionLogs, execution, logId, cb) => {
        let r = executionResults(execution, executionLogs, {external: true})
        console.log({r})
        executionCb(cb, executionLogs, 'e1')
      }
    },
    {
      name: 'e2',
      capabilities: {
        runInOneGo: true
      },
      callback: (user, currentStep, executionLogs, execution, logId, cb) => {
        let r = executionResults(execution, executionLogs, {external: true})
        console.log({r})
        executionCb(cb, executionLogs, 'e2')
      }
    },
    {
      name: 'e3',
      capabilities: {
        runInOneGo: true
      },
      callback: (user, currentStep, executionLogs, execution, logId, cb) => {
        let r = executionResults(execution, executionLogs, {external: true})
        console.log({r})
        executionCb(cb, executionLogs, 'e3')
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)