import * as tfQueue from '/imports/queue/server'
import { buildLinks } from '/imports/queue/server/helpers/links'

import { Channels } from '/imports/modules/channels/both/collection.js'
import { triggerFlows } from '/imports/queue/server'

let Parser = require('rss-parser')
let parser = new Parser()

let debug = console.log

tfQueue.jobs.register('s-rss-runOne', function(channel) {
  let instance = this
  let getfeed = Meteor.wrapAsync((cb) => {
    parser.parseURL(channel.config.channelUrl, (err, feed) => {
      cb(err, feed)
    })
  })

  let feed = getfeed()
  let rssGuids = feed.items.map(i => { return i.guid })
  let arrays = [rssGuids, (channel.details || {}).guids || []]

  // _.difference
  let diffs = arrays.reduce((a, b) => a.filter(c => !b.includes(c)))

  if (diffs.length) {
    let user = Meteor.users.findOne({_id: channel.user}, {
      fields: { services: false }
    })
    
    Channels.update(
      { _id: channel._id },
      { $addToSet: {'details.guids':{$each: diffs}} }
    )

    let newRssElements = feed.items.filter(i => {
      return diffs.indexOf(i.guid) >= 0
    })

    triggerFlows(
      channel,
      user,
      {
        'trigger._id': channel._id,
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
  debug('s-rss-schedule')

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

  debug('Find channels')

  const channels = Channels.find({
    type: 'rss'
  })

  debug(`Channels found: ${channels.count()}`)

  if (!channels || !channels.count()) {
    finishJob()
    return
  }

  channels.map(channel => {
    tfQueue.jobs.create('s-rss-runOne', channel, {
      singular: true
    })
  })

  finishJob()
  return
})

Meteor.startup(() => {
  return;
  tfQueue.jobs.run('s-rss-schedule', null, {
    singular: true
  })
})