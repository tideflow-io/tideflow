import filesLib from '/imports/modules/files/server/lib'
import { servicesAvailable } from '/imports/services/_root/server'

const service = {
  name: 'file',
  inputable: false,
  stepable: true,
  ownable: false,
  hooks: {
    // service: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'create-file',
      visibe: true,
      callback: (user, currentStep, executionLogs, execution, logId, cb) => {
        let previousStepsData = executionLogs.map(el => el.stepResult)

        previousStepsData.map(data => {
          if (data.type === 'file') data.data.data = '...'
        })

        filesLib.create({
          user: user._id,
          name: `${execution._id}.json`
        }, JSON.stringify(previousStepsData, ' ', 2))

        cb(null, {
          result: {
            type: 'file',
            data: {}
          },
          next: true,
          msgs: [
            {
              m: 's-file.log.create-file.created',
              p: [],
              d: new Date()
            }
          ]
        })
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)