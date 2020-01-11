import { Meteor } from 'meteor/meteor'
const crypto = require('crypto')

import { Router } from 'meteor/iron:router'

import { Services } from '/imports/modules/services/both/collection'

const webhooks = require('./github-webhooks')

/**
 * Compares the request's x-hub-signature against the service's webhook secret.
 * See https://developer.github.com/webhooks/securing/
 * 
 * @param {Object} service Service document from the database
 * @param {Object} req Original iron router's server side request
 */
const validateReqSignature = (service, req) => {
  try {
    const hmac = crypto.createHmac('sha1', service.config.secret)
    hmac.update(JSON.stringify(req.body), 'utf-8')
    return req.headers['x-hub-signature'] === `sha1=${hmac.digest('hex')}`
  } catch (ex) { return false }
}


// Array.prototype.diff = function(a) {
//   return this.filter(function(i) {return a.indexOf(i) < 0;});
// };

Router.route('/ghci/:uuid', function () {

  // Ignore requests without body
  if (!this.request.body) {
    res.writeHead(404)
    res.end()
    return
  }

  const body = this.request.body

  const req = this.request
  const res = this.response
  
  const uuid = this.params.uuid

  // Find services using this GH's webhook endpoint
  const service = Services.findOne({
    type: 'gh-ci',
    'config.endpoint': uuid
  })

  // Ignore request that don't resolve to a service
  if (!service) {
    res.writeHead(404)
    res.end()
    return
  }

  // Validate the request secret with the one stored in the DB
  if (!validateReqSignature(service, req)) {
    res.writeHead(401)
    res.end('x-hub-signature validation failed')
    return
  }

  // Send a response back to the client
  res.end(JSON.stringify({status: 'queued'}))

  // Grab the user who created the service
  let user = Meteor.users.findOne({_id: service.user}, {
    fields: { services: false }
  })

  // Ignore the execution if for some reason the owner is not found
  if (!user) return null

  // Ignore requests checking the endpoint
  if (body.zen) {
    return
  }

  switch (req.headers['x-github-event']) {
  case 'installation_repositories':
  case 'installation':
    return webhooks.installations.run(service, body)
  case 'pull_request':
    return webhooks.pullRequest.run(service, body)
  case 'push':
    return webhooks.push.run(service, body)
  case 'check_suite':
    return webhooks.checkSuite.run(service, body)
  }

}, {where: 'server'})