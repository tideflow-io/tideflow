import * as commonEmailHelper from '/imports/helpers/both/emails'
import * as emailHelper from '/imports/helpers/server/emails'
import { servicesAvailable, getResultsTypes } from '/imports/services/_root/server'

const service = {
  name: 'email-outgoing',
  inputable: false,
  stepable: true,
  ownable: false,
  hooks: {
    // service: {},
    // step: {},
    // trigger: {}
  },
  events: [{
    name: 'to-me',
    capabilities: {
      runInOneGo: true
    },
    callback: (user, currentStep, executionLogs, execution, logId, cb) => {
      const { fullFlow } = execution
      const to = commonEmailHelper.userEmail(user)

      if (!to) {
        throw new Error('No emails registered')
      }

      const fullName = user.profile ? user.profile.firstName || to : to

      const attachPrevious = (currentStep.config.inputLast || '') === 'yes'

      let files = attachPrevious ? getResultsTypes(executionLogs, 'files') : []
      let links = attachPrevious ? getResultsTypes(executionLogs, 'links') : []
      let objects = attachPrevious ? getResultsTypes(executionLogs, 'data') : []

      objects = objects.map(o => {
        return {
          content: JSON.stringify(o, ' ', 2)
        }
      })

      let tplVars = {
        messageTitle: fullFlow.title,
        fullName,
        userEmail: to,
        lines: (currentStep.config.body || '').split('\n'),
        links,
        objects,
        sentOutside: false
      }

      let data = emailHelper.data([to], currentStep, tplVars, 'standard')

      data.attachments = files.map(file => {
        return {
          content: Buffer.from(file.data),
          filename: file.fileName
        }
      })

      emailHelper.send(data)

      cb(null, {
        result: {},
        next: true,
        msgs: [
          {
            m: 's-email-outgoing.log.to-me.sent',
            p: [to],
            d: new Date()
          }
        ]
      })
    }
  },
  {
    name: 'to-others',
    visibe: true,
    capabilities: {
      runInOneGo: true
    },
    callback: (user, currentStep, executionLogs, execution, logId, cb) => {
      const { fullFlow } = execution
      const attachPrevious = (currentStep.config.inputLast || '') === 'yes'
      const previousStepsData = executionLogs.map(el => el.stepResult)
      const to = (currentStep.config.emailTo || '').split(',').map(e => e.trim())
      const userEmail = commonEmailHelper.userEmail(user)
      const fullName = user.profile ? user.profile.firstName || userEmail : userEmail

      let files = attachPrevious ? getResultsTypes(executionLogs, 'files') : []
      let links = attachPrevious ? getResultsTypes(executionLogs, 'links') : []
      let objects = attachPrevious ? getResultsTypes(executionLogs, 'data') : []

      objects = objects.map(o => {
        return {
          content: JSON.stringify(o.data, ' ', 2)
        }
      })

      let tplVars = {
        messageTitle: fullFlow.title,
        fullName,
        userEmail,
        lines: (currentStep.config.body || '').split('\n'),
        links,
        objects,
        sentOutside: true
      }

      let data = emailHelper.data(to, currentStep, tplVars, 'standard')

      if (!data.to || data.to.trim() === '') return null

      data.attachments = files.map(file => {
        return {
          content: Buffer.from(file.data),
          filename: file.fileName
        }
      })

      emailHelper.send(data)

      cb(null, {
        result: {},
        next: true,
        msgs: [
          {
            m: 's-email-outgoing.log.to-others.sent',
            p: to,
            d: new Date()
          }
        ]
      })
    }
  }]
}

module.exports.service = service

servicesAvailable.push(service)