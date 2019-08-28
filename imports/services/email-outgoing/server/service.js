import * as commonEmailHelper from '/imports/helpers/both/emails'
import * as emailHelper from '/imports/helpers/server/emails'
import { servicesAvailable } from '/imports/services/_root/server'

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
    visibe: true,
    callback: (service, flow, triggerData, user, currentStep, executionLogs, executionId, logId, cb) => {
      const attachPrevious = (currentStep.config.inputLast || '') === 'yes'
      const lastData = _.last(executionLogs) ? _.last(executionLogs).stepResults : null
      const to = commonEmailHelper.userEmail(user)
      const files = attachPrevious ? (lastData || []).filter(data => data.type === 'file') : []

      if (!to) {
        throw new Error('No emails registered')
      }

      const fullName = user.profile ? user.profile.firstName || to : to

      let links = attachPrevious ? (lastData || []).filter(data => data.type === 'link') : []
      let objects = attachPrevious ? (lastData || []).filter(data => data.type === 'object') : []

      objects = objects.map(o => {
        return {
          content: JSON.stringify(o.data, ' ', 2)
        }
      })

      let tplVars = {
        messageTitle: flow.title,
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
          content: new Buffer(file.data.data),
          filename: file.data.fileName
        }
      })

      emailHelper.send(data)

      cb(null, {
        result: [],
        next: true
      })
    }
  },
  {
    name: 'to-others',
    visibe: true,
    callback: (service, flow, triggerData, user, currentStep, executionLogs, executionId, logId, cb) => {
      const attachPrevious = (currentStep.config.inputLast || '') === 'yes'
      const lastData = _.last(executionLogs) ? _.last(executionLogs).stepResults : null
      const files = attachPrevious ? (lastData || []).filter(data => data.type === 'file') : []
      const to = (currentStep.config.emailTo || '').split(',').map(e => e.trim())
      const userEmail = commonEmailHelper.userEmail(user)
      const fullName = user.profile ? user.profile.firstName || userEmail : userEmail

      let links = attachPrevious ? (lastData || []).filter(data => data.type === 'link') : []
      let objects = attachPrevious ? (lastData || []).filter(data => data.type === 'object') : []

      objects = objects.map(o => {
        return {
          content: JSON.stringify(o.data, ' ', 2)
        }
      })

      let tplVars = {
        messageTitle: flow.title,
        fullName,
        userEmail,
        lines: currentStep.config.body.split('\n'),
        links,
        objects,
        sentOutside: true
      }

      let data = emailHelper.data(to, currentStep, tplVars, 'standard')

      if (!data.to || data.to.trim() === '') return null;

      data.attachments = files.map(file => {
        return {
          content: new Buffer(file.data.data),
          filename: file.data.fileName
        }
      })

      emailHelper.send(data)

      cb(null, {
        result: [],
        next: true
      })
    }
  }]
}

module.exports.service = service

servicesAvailable.push(service)