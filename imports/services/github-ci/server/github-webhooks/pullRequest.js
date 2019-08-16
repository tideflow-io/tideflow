import { Flows } from '/imports/modules/flows/both/collection.js'

import { triggerFlows } from '/imports/queue/server'

const opened = (service, body) => {

  // Get flows
  const flows = Flows.find({
    'trigger.type': 'gh-ci',
    'trigger.event': 'pull_request',
    'trigger.config.repository': body.pull_request.head.repo.id.toString(),
    status: 'enabled'
  })

  console.log({
    'trigger.type': 'gh-ci',
    'trigger.event': 'pull_request',
    'trigger.config.repository': body.pull_request.head.repo.id.toString(),
    status: 'enabled'
  })

  if (!flows || !flows.count()) {
    console.log('no flows')
    return
  }

  console.log({flows})

  flows.fetch().map(flow => {

    console.log({flow})

    let user = Meteor.users.findOne({_id: service.user}, {
      fields: { services: false }
    })
  
    // Ignore the execution if for some reason the owner is not found
    if (!user) {
      return null
    }

    triggerFlows(
      flow.trigger,
      user,
      null,
      [{
        type: 'object',
        data: body
      }],
      [flow]
    )
  })
}

const run = (service, body) => {
  if (body.action === 'opened') {
    opened(service, body)
    return;
  }
}

module.exports.run = run