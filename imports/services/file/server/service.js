import filesLib from '/imports/modules/files/server/lib'
import { servicesAvailable } from '/imports/services/_root/server'
const slugify = require('slugify')

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

        const fileName = slugify(`${execution.fullFlow.title} ${execution._id.substring(0, 3)}`).toLowerCase()

        filesLib.create({
          user: user._id,
          name: `${fileName}.json`
        }, JSON.stringify(previousStepsData, ' ', 2))

        cb(null, {
          result: {
            type: 'file',
            data: {}
          },
          next: false,
          error: false,
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