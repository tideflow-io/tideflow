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
      callback: (user, currentStep, executionLogs, execution, logId, cb) => {
        const lastData = _.last(executionLogs) ? _.last(executionLogs).stepResult : null
        
        let result = buildLinks(lastData).map(element => {
          return {
            type: 'link',
            data: element
          }
        })

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