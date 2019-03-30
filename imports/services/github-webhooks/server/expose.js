import { Router } from 'meteor/iron:router'
import { buildLinks } from '/imports/queue/server/helpers/links'

import { Services } from '/imports/modules/services/both/collection'

import { triggerFlows } from '/imports/queue/server'

const crypto = require('crypto')

/**
 * Compares the request's x-hub-signature against the service's webhook secret.
 * See https://developer.github.com/webhooks/securing/
 * 
 * @param {Object} service Service document from the database
 * @param {Object} req Original iron router's server side request
 */
const validateSignature = (service, req) => {
  try {
    const hmac = crypto.createHmac('sha1', service.config.secret)
    hmac.update(JSON.stringify(req.body), 'utf-8')
    return req.headers['x-hub-signature'] === `sha1=${hmac.digest('hex')}`
  } catch (ex) { return false }
}

Router.route('/ghwebhook/:uuid', function () {

  // Ignore requests without body
  if (!this.request.body) {
    res.writeHead(404)
    res.end()
    return
  }

  const req = this.request;
  const res = this.response;
  const uuid = this.params.uuid

  // Find services using this GH's webhook endpoint
  const service = Services.findOne({
    type: 'gh-webhooks',
    'config.endpoint': uuid
  })

  // Ignore request that don't resolve to a service
  if (!service) {
    res.writeHead(404)
    res.end()
    return
  }

  // Validate the request secret with the one stored in the DB
  if (!validateSignature(service, req)) {
    res.writeHead(401)
    res.end()
    return
  }

  // Send a response back to the client
  res.end('queued')

  // Grab the user who created the service
  let user = Meteor.users.findOne({_id: service.user}, {
    fields: { services: false }
  })

  // Ignore the execution if for some reason the owner is not found
  if (!user) {
    return null
  }

  // Get the workflows using this endpoint's service
  const flowsQuery = {status: 'enabled', 'trigger._id': service._id}

  let data = []

  // Ignore requests checking the endpoint
  if (req.body.zen) { return }

  req.body = Array.isArray(req.body) ? req.body : [req.body]

  // Attach the request - as-is - as "objects"
  data = req.body.map(element => {
    return {
      type: 'object',
      data: element
    }
  })

  // In case the webhook contains GH issues, attach them as navigable links.
  buildLinks(req.body.filter(b => !!b.issue), {
    author: 'issue.user.login',
    title: 'issue.title', 
    link: 'issue.html_url',
    tags: 'issue.labels',
    date: 'issue.updated_at',
    snippet: 'issue.body'
  }, true)
    .map(element => {
      if (element.tf_tags && element.tf_tags.length) {
        element.tf_tags = element.tf_tags.map(t => t.name)
      }
      data.push({ type: 'link', data: element })
    })

  // Trigger flows
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