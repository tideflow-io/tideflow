import { Template } from 'meteor/templating'
import { moment } from 'meteor/momentjs:moment'

import { Channels } from '/imports/modules/channels/both/collection.js'

Template.registerHelper('sAgentReportStatusDot', function() {
  try {
    return this ? this.details.online ?
      `<div class="s-agent-status-dot online"></div>` :
      `
        <div class="s-agent-status-dot offline"></div>
      ` :
      ''
  }
  catch (ex) {
    return ''
  }
})

Template.registerHelper('sAgentReportStatus', function() {
  try {
    return this ? this.details.online ?
      `` :
      `
        ${i18n.__('s-agent.channel.status.lastSeen')}
        ${moment(this.details.lastSeen).fromNow() || '-'}
      ` :
      ''
  }
  catch (ex) {
    return ''
  }
})

Template.servicesAgentExecuteConfig.helpers({
  registeredAgents: () => {
    return Channels.find({type: 'agent'}).map(a => {
      return {
        _id: a._id,
        title: a.title
      }
    })
  },
  selectedAgent: function(compare) {
    return this._id === compare ? 'selected' : ''
  }
})
