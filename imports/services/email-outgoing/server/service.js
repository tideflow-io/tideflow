import * as commonEmailHelper from '/imports/helpers/both/emails'
import * as emailHelper from '/imports/helpers/server/emails'
import { servicesAvailable } from '/imports/services/_root/server'

import { step, stepData } from '/imports/queue/server'

const debug = console.log

const service = {
  name: 'email-outgoing',
  inputable: false,
  stepable: true,
  ownable: false,
  hooks: {
    // channel: {},
    // step: {},
    // trigger: {}
  },
  events: [{
    name: 'to-me',
    visibe: true,
    callback: (channel, flow, user, currentStep, executionLogs, executionId, logId, cb) => {
      const attachPrevious = (currentStep.config.inputLast || '') === 'yes'
      const lastData = stepData(executionLogs, 'last')
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
        sentVia: flow.title,
        lines: (currentStep.config.body || '').split('\n'),
        links,
        objects,
        allowReply: false
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
    },
    conditions: [
      // {}
    ]
  },
  {
    name: 'to-others',
    visibe: true,
    callback: (channel, flow, user, currentStep, executionLogs, executionId, logId, cb) => {
      const attachPrevious = (currentStep.config.inputLast || '') === 'yes'
      const lastData = stepData(executionLogs, 'last')
      const files = attachPrevious ? (lastData || []).filter(data => data.type === 'file') : []
      const to = (currentStep.config.emailTo || '').split(',').map(e => e.trim())
      const userEmail = emailHelper.userEmail(user)
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
        sentVia: flow.title,
        lines: currentStep.config.body.split('\n'),
        links,
        objects,
        allowReply: true,
        replyButtonText: `Reply to ${fullName}`
      }

      let data = emailHelper.data(to, currentStep, tplVars, 'standard')

      if (!data.to || data.to.trim() === '') return null;

      files.map((f) => {
        let getFile = Meteor.wrapAsync((cb) => {
          let bufferChunks = []
          f.data.data.on('readable', () => {
            // Store buffer chunk to array
            let i = f.data.data.read()
            if (!i) return
            bufferChunks.push(i)
          })
          f.data.data.on('end', () => {
            cb(null, Buffer.concat(bufferChunks))
          })
        })

        debug('Attached!')

        data.attachments = files.map(file => {
          return {
            content: new Buffer(file.data.data),
            filename: file.data.fileName
          }
        })
      })

      emailHelper.send(data)

      cb(null, {
        result: [],
        next: true
      })
    },
    conditions: [
      // {}
    ]
  }]
}

module.exports.service = service

servicesAvailable.push(service)