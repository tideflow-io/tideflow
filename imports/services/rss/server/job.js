import { Meteor } from 'meteor/meteor'
import * as tfQueue from '/imports/queue/server'
import { buildLinks } from '/imports/queue/server/helpers/links'

import { Flows } from '/imports/modules/flows/both/collection.js'
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
      buildLinks(newRssElements).map(element => {
        return {
          type: 'link',
          data: element
        }
      }),
      [flow]
    )
  }
  instance.success()
})

tfQueue.jobs.register('s-rss-schedule', function() {
  let instance = this

  const finishJob = () => {
    //instance.replicate({ in: { seconds: 5 } })
    instance.replicate({
      singular: true,
      in: {
        hours: 1
      }
    })

    instance.success()
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
  console.log('schedule rss')
  tfQueue.jobs.run('s-rss-schedule', null, {
    singular: true
  })
})


