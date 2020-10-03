import { servicesAvailable, buildTemplate } from '/imports/services/_root/server'

import { sendNotification } from './helpers/httpClient'
import { getOnesignalService } from './helpers/app'

const service = {
  name: 'onesignal',
  humanName: 's-onesignal.name',
  inputable: false,
  stepable: true,
  ownable: true,
  templates: {},
  events: [
    {
      name: 'sendnotification',
      capabilities: {
        runInOneGo: true
      },
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        try {
          currentStep.config.segment = buildTemplate(execution, executionLogs, currentStep.config.segment)
          currentStep.config.title = buildTemplate(execution, executionLogs, currentStep.config.title)
          currentStep.config.content = buildTemplate(execution, executionLogs, currentStep.config.content)

          const appConfig = getOnesignalService(currentStep)
          let data = await sendNotification(appConfig, currentStep)

          let fullLog = (data.body.errors || []).map(err => {
            return { m: err, d: new Date(), err: true }
          })

          const { id, recipients, external_id } = data.body

          if (data.body.recipients) {
            fullLog.push({
              m: 's-onesignal.events.sendnotification.log.success', p: { id, recipients, external_id }, d: new Date(), err: false
            })
          }
          
          cb(null, {
            result: (data.body && data.statusCode === 200) ? { data: data.body } : {},
            error: data.statusCode !== 200,
            next: true,
            msgs: fullLog
          })
        }
        catch (ex) {
          cb(null, {
            result: {},
            error: true,
            next: true,
            msgs: [{ m: ex.message, d: new Date(), err: true }]
          })
        }
        
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)
