import { Template } from 'meteor/templating'
import { Flows } from '/imports/modules/flows/both/collection'

import { copyTextToClipboard } from '/imports/helpers/client/clipboard/helper'

Template['flows.index'].helpers({

  /**
   * [
   *   { type: 'endpoint', flows: [] },
   *   { type: 'rss',      flows: [] },
   *   { type: 'cron',     flows: [] }
   * ]
   */
  'flows': () => {
    let result = []
    const list = Flows.find({})
    list.map(item => {
      let type = item.trigger.type
      let found = result.find(ri => ri.type === type)
      if (found) found.flows.push(item)
      else result.push({type, flows: [item]})
    })
    return result
  }
})

Template.flowsIndexListItem.events({
  'click .copy-s-endpoint-url': (event, template) => {
    event.preventDefault()
    event.stopPropagation()
    const endpoint = template.data.trigger.config.endpoint
    copyTextToClipboard(`${Meteor.absoluteUrl()}service/endpoint/${endpoint}`)
  }
})
