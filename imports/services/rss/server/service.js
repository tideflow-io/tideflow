import { servicesAvailable } from '/imports/services/_root/server'

import { buildLinks } from '/imports/queue/server/helpers/links'

const service = {
  name: 'rss',
  inputable: true,
  stepable: false,
  ownable: false,
  hooks: {
  },
  events: [
    {
      name: 'new-content',
      visibe: true,
      capabilities: {
        runInOneGo: true
      },
      callback: (user, currentStep, executionLogs, execution, logId, cb) => {
        const lastData = ([].concat(executionLogs).pop() || {}).stepResult
        
        let result = {
          links: buildLinks(lastData)
        }

        cb(null, {
          result: result,
          next: true,
          msgs: [
            {
              m: 's-rss.log.new-content.new-content-available',
              p: [lastData.length],
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