import { Meteor } from 'meteor/meteor'
import Handlebars from 'handlebars'
import { Router } from 'meteor/iron:router'

import { Channels } from '/imports/modules/channels/both/collection.js'
import { triggerFlows } from '/imports/queue/server'

Router.route('/webform/:uuid', function () {
  const req = this.request
  const res = this.response
  const uuid = this.params.uuid

  const channel = Channels.findOne({
    type: 'webform',
    'config.endpoint': uuid
  })

  if (!channel) {
    res.writeHead(404)
    res.end()
    return
  }

  const postUrl = Meteor.absoluteUrl(`webform/${uuid}/submit`)

  const content = Assets.getText('webform/expose.html')

  let form = (channel.details||{}).form || {}

  const { successMessage, successUrl } = channel.config

  form = JSON.stringify(form)

  const html = Handlebars.compile(content)({
    // channel,
    form,
    postUrl,
    successMessage: successMessage || 'Form submitted',
    successUrl: successUrl || null
  })

  res.end(html)
  return
}, {where: 'server'})

Router.route('/webform/:uuid/submit', function () {
  const req = this.request
  const res = this.response
  const uuid = this.params.uuid
  const channel = Channels.findOne({
    type: 'webform',
    'config.endpoint': uuid
  })

  res.end('{}')

  if (!channel) {
    res.writeHead(404)
    res.end()
    return
  }

  let user = Meteor.users.findOne({_id: channel.user}, {
    fields: { services: false }
  })
  if (!user) {
    return null
  }

  let data = []

  if (!req.body) { return }

  req.body = Array.isArray(req.body) ? req.body : [req.body]

  data = req.body.map(element => {
    return {
      type: 'object',
      data: element
    }
  })

  triggerFlows(
    channel,
    user,
    {
      'trigger._id': channel._id,
      'trigger.event': 'submitted'
    },
    data
  )
}, {where: 'server'})