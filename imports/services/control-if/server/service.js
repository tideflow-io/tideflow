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
        m: `s-control-if.log.${name}`,
        p: [],
        d: new Date()
      }
    ]
  })
}

const service = {
  name: 'control-if',
  inputable: false,
  stepable: true,
  ownable: false,
  control: true,
  events: [
    {
      name: 'e1',
      capabilities: {
        runInOneGo: true
      },
      callback: (user, currentStep, executionLogs, execution, logId, cb) => 
        executionCb(cb, executionLogs, 'e1')
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)