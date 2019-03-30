import { Meteor } from 'meteor/meteor'
import * as tfQueue from '/imports/queue/server'
import { buildLinks } from '/imports/queue/server/helpers/links'

import { Services } from '/imports/modules/services/both/collection.js'
import { triggerFlows } from '/imports/queue/server'

let Parser = require('rss-parser')
let parser = new Parser()

tfQueue.jobs.register('s-rss-runOne', function(service) {
  let instance = this
  let getfeed = Meteor.wrapAsync((cb) => {
    parser.parseURL(service.config.serviceUrl, (err, feed) => {
      cb(err, feed)
    })
  })

  let feed = getfeed()
  let rssGuids = feed.items.map(i => { return i.guid })
  let arrays = [rssGuids, (service.details || {}).guids || []]

  // _.difference
  let diffs = arrays.reduce((a, b) => a.filter(c => !b.includes(c)))

  if (diffs.length) {
    let user = Meteor.users.findOne({_id: service.user}, {
      fields: { services: false }
    })
    
    Services.update(
      { _id: service._id },
      { $addToSet: {'details.guids':{$each: diffs}} }
    )

    let newRssElements = feed.items.filter(i => {
      return diffs.indexOf(i.guid) >= 0
    })

    triggerFlows(
      service,
      user,
      {
        'trigger._id': service._id,
        'trigger.event': 'new-content'
      },
      buildLinks(newRssElements).map(element => {
        return {
          type: 'link',
          data: element
        }
      })
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

  const services = Services.find({
    type: 'rss'
  })

  if (!services || !services.count()) {
    finishJob()
    return
  }

  services.map(service => {
    tfQueue.jobs.create('s-rss-runOne', service, {
      singular: true
    })
  })

  finishJob()
  return
})

Meteor.startup(() => {
  tfQueue.jobs.run('s-rss-schedule', null, {
    singular: true
  })
})
