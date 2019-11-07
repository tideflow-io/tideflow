import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'

import { Flows } from '/imports/modules/flows/both/collection'

import { triggerFlows } from '/imports/queue/server'

Router.route('/service/endpoint/:uuid', function () {
  const req = this.request
  const res = this.response
  const uuid = this.params.uuid
  const flow = Flows.findOne({
    status: 'enabled',
    'trigger.type': 'endpoint',
    'trigger.event': 'called',
    'trigger.config.endpoint': uuid
  })

  if (!flow) {
    res.writeHead(404)
    res.end()
    return
  }

  res.end('queued')

  let user = Meteor.users.findOne({_id: flow.user}, {
    fields: { services: false }
  })

  if (!user) {
    return null
  }

  if (!req.body) { return }

  triggerFlows(
    flow.trigger,
    user,
    null,
    {
      type: 'object',
      data: req.body
    },
    [flow]
  )
  
}, {where: 'server'})