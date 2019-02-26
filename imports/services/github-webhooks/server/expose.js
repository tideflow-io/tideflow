import { Router } from 'meteor/iron:router'

import { Channels } from "/imports/modules/channels/both/collection.js"

import { triggerFlows } from '/imports/queue/server'

const crypto = require('crypto')

const debug = console.log

/**
 * Compares the request's x-hub-signature against the channel's webhook secret.
 * See https://developer.github.com/webhooks/securing/
 * 
 * @param {Object} channel Channel document from the database
 * @param {Object} req Original iron router's server side request
 */
const validateSignature = (channel, req) => {
  try {
    const hmac = crypto.createHmac('sha1', channel.config.secret)
    hmac.update(JSON.stringify(req.body), 'utf-8')
    return req.headers['x-hub-signature'] === `sha1=${hmac.digest('hex')}`
  } catch (ex) { return false }
}

Router.route('/ghwebhook/:uuid', function () {
  // Ignore requests without body
  if (!this.request.body) {
    debug('no body')
    res.writeHead(404)
    res.end()
    return
  }

  const req = this.request;
  const res = this.response;
  const uuid = this.params.uuid

  const channel = Channels.findOne({
    type: 'gh-webhooks',
    'config.endpoint': uuid
  })

  if (!validateSignature(channel, req)) {
    debug('Wrong Secret')
    res.writeHead(401)
    res.end()
    return
  }

  if (!channel) {
    debug('no channel')
    res.writeHead(404)
    res.end()
    return
  }

  res.end('queued')

  let user = Meteor.users.findOne({_id: channel.user}, {
    fields: { services: false }
  })

  if (!user) {
    debug('User not found. Skipping')
    return null
  }

  const flowsQuery = {status: 'enabled', 'trigger._id': channel._id}

  debug(`Filtering flows ${JSON.stringify(flowsQuery)}`)

  let data = []

  // Ignore requests checking the endpoint
  if (req.body.zen) { return }

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