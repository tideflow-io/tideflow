import { Meteor } from 'meteor/meteor'
import * as tfQueue from '/imports/queue/server'

import { Flows } from '/imports/modules/flows/both/collection'
import { triggerFlows } from '/imports/queue/server'

let Parser = require('rss-parser')
let parser = new Parser()

tfQueue.jobs.register('s-rss-runOne', function(flow) {
  let instance = this

  let feed = Meteor.wrapAsync((cb) => {
    parser.parseURL(flow.trigger.config.serviceUrl, (err, feed) => {
      cb(err, feed)
    })
  })()

  let rssGuids = feed.items.map(i => { return i.guid })
  let arrays = [rssGuids, (flow.trigger.secrets || {}).guids || []]

  // _.difference
  let diffs = arrays.reduce((a, b) => a.filter(c => !b.includes(c)))

  if (diffs.length) {
    let user = Meteor.users.findOne({_id: flow.user}, {
      fields: { services: false }
    })
    
    Flows.update(
      { _id: flow._id },
      { $addToSet: {'trigger.secrets.guids': {$each: diffs}} }
    )

    let newRssElements = feed.items.filter(i => {
      return diffs.indexOf(i.guid) >= 0
    })

    triggerFlows(
      flow.trigger,
      user,
      null,
      [newRssElements],
      [flow]
    )
  }
  instance.remove()
})

tfQueue.jobs.register('s-rss-schedule', function() {
  let instance = this

  const finishJob = () => {
    instance.remove()
    instance.replicate({
      singular: true,
      in: {
        hours: 1
      },
      date: instance.document.due
    })
  }

  const flows = Flows.find({
    'trigger.type': 'rss',
    'trigger.event': 'new-content',
    status: 'enabled'
  })

  if (!flows || !flows.count()) {
    finishJob()
    return
  }

  flows.map(flow => {
    tfQueue.jobs.create('s-rss-runOne', flow, {
      singular: true
    })
  })

  finishJob()
})

Meteor.startup(() => {
  tfQueue.jobs.run('s-rss-schedule', null, {
    singular: true
  })
})
