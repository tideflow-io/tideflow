import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'

import { Channels } from '/imports/modules/channels/both/collection'

import { triggerFlows } from '/imports/queue/server'

Router.route('/endpoint/:uuid', function () {
  const req = this.request
  const res = this.response
  const uuid = this.params.uuid
  const channel = Channels.findOne({
    type: 'endpoint',
    'config.endpoint': uuid
  })

  if (!channel) {
    res.writeHead(404)
    res.end()
    return
  }

  res.end('queued')

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
      'trigger.event': 'called'
    },
    data
  )
}, {where: 'server'})