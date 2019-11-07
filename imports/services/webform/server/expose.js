import { Meteor } from 'meteor/meteor'
import Handlebars from 'handlebars'
import { Router } from 'meteor/iron:router'

import { Services } from '/imports/modules/services/both/collection.js'
import { triggerFlows } from '/imports/queue/server'

Router.route('/webform/:uuid', function () {
  const req = this.request
  const res = this.response
  const uuid = this.params.uuid

  const service = Services.findOne({
    type: 'webform',
    'config.endpoint': uuid
  })

  if (!service) {
    res.writeHead(404)
    res.end()
    return
  }

  const postUrl = Meteor.absoluteUrl(`webform/${uuid}/submit`)

  const content = Assets.getText('webform/expose.html')

  let form = (service.details||{}).form || {}

  const { successMessage, successUrl } = service.config

  form = JSON.stringify(form)

  const html = Handlebars.compile(content)({
    // service,
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
  const service = Services.findOne({
    type: 'webform',
    'config.endpoint': uuid
  })

  res.end('{}')

  if (!service) {
    res.writeHead(404)
    res.end()
    return
  }

  let user = Meteor.users.findOne({_id: service.user}, {
    fields: { services: false }
  })
  if (!user) {
    return null
  }

  if (!req.body) { return }

  triggerFlows(
    service,
    user,
    {
      'trigger._id': service._id,
      'trigger.event': 'submitted'
    },
    {
      type: 'object',
      data: req.body
    }
  )
}, {where: 'server'})