import { Meteor } from 'meteor/meteor'
import { Flows } from '/imports/modules/flows/both/collection.js'

import { triggerFlows } from '/imports/queue/server'

const opened = (service, body) => {
  const ghBranch = webhook.pull_request.head.ref

  const flows = Flows.find({
    'trigger.type': 'gh-ci',
    'trigger.event': 'pull_request',
    'trigger.config.branch': { $in: ['*', '', ghBranch] },
    'trigger.config.repository': body.pull_request.head.repo.id.toString(),
    status: 'enabled'
  })

  if (!flows || !flows.count()) {
    return
  }

  flows.fetch().map(flow => {
    let user = Meteor.users.findOne({_id: service.user}, {
      fields: { services: false }
    })
  
    // Ignore the execution if for some reason the owner is not found
    if (!user) {
      return null
    }

    triggerFlows(
      service,
      user,
      null,
      {
        type: 'object',
        data: body
      },
      [flow]
    )
  })
}

const run = (service, body) => {
  if (['opened', 'synchronize'].includes(body.action)) {
    opened(service, body)
    return;
  }
}

module.exports.run = run