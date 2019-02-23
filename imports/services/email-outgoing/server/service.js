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
    callback: (channel, flow, user, currentStep, executionLogs, executionId, logId) => {
      const attachPrevious = (currentStep.config.inputLast || '') === 'yes'
      const lastData = stepData(executionLogs, 'last')
      const to = commonEmailHelper.userEmail(user)
      const files = attachPrevious ? (lastData || []).filter(data => data.type === 'file') : []

      if (!to) {
        throw new Error('No emails registered')
      }

      const fullName = user.profile ? user.profile.firstName || to : to
      let tplVars = {
        messageTitle: flow.title,
        fullName,
        userEmail: to,
        sentVia: flow.title,
        lines: (currentStep.config.body || '').split('\n'),
        links: attachPrevious ? (lastData || []).filter(data => data.type === 'link') : [],
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

      return {
        result: [],
        next: true
      }
    },
    conditions: [
      // {}
    ]
  },
  {
    name: 'to-others',
    visibe: true,
    callback: (channel, flow, user, currentStep, executionLogs, executionId, logId) => {
      const attachPrevious = (currentStep.config.inputLast || '') === 'yes'
      const lastData = stepData(executionLogs, 'last')
      const files = attachPrevious ? (lastData || []).filter(data => data.type === 'file') : []
      const to = (currentStep.config.emailTo || '').split(',').map(e => e.trim())
      const fullName = user.profile ? user.profile.firstName || userEmail.address : userEmail.address

      let tplVars = {
        messageTitle: flow.title,
        fullName,
        userEmail: userEmail.address,
        sentVia: flow.title,
        lines: currentStep.config.body.split('\n'),
        links: attachPrevious ? (lastData || []).filter(data => data.type === 'link') : [],
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
        data.attachment.push(new mailgun.Attachment({
          data: getFile(),
          filename: f.data.fileName
        }))
      })

      emailHelper.send(data)

      return {
        result: [],
        next: true
      }
    },
    conditions: [
      // {}
    ]
  }]
}

module.exports.service = service

servicesAvailable.push(service)