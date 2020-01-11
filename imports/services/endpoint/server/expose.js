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

  res.end(JSON.stringify({status: 'queued'}))

  let user = Meteor.users.findOne({_id: flow.user}, {
    fields: { services: false }
  })

  if (!user) {
    return null
  }

  let result = {}

  if (req.body) result.data = req.body
  if (req.files) result.files = req.files

  if (!Object.keys(result).length) { return }

  triggerFlows(
    flow.trigger,
    user,
    null,
    result,
    [flow]
  )
  
}, {where: 'server'})