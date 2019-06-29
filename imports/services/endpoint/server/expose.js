import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'

import { Services } from '/imports/modules/services/both/collection'

import { triggerFlows } from '/imports/queue/server'

Router.route('/service/endpoint/:uuid', function () {
  const req = this.request
  const res = this.response
  const uuid = this.params.uuid
  const service = Services.findOne({
    type: 'endpoint',
    'config.endpoint': uuid
  })

  if (!service) {
    res.writeHead(404)
    res.end()
    return
  }

  res.end('queued')

  let user = Meteor.users.findOne({_id: service.user}, {
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
    service,
    user,
    {
      'trigger._id': service._id,
      'trigger.event': 'called'
    },
    data
  )
}, {where: 'server'})