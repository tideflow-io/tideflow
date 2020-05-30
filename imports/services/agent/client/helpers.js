import { Template } from 'meteor/templating'
import { moment } from 'meteor/momentjs:moment'

import { Services } from '/imports/modules/services/both/collection'
import { Files } from '/imports/modules/files/both/collection'

Template.registerHelper('sAgentReportStatusDot', function() {
  try {
    return this ? this.details.online ?
      '<div class="s-agent-status-dot online"></div>' :
      '<div class="s-agent-status-dot offline"></div>' :
      ''
  }
  catch (ex) {
    return ''
  }
})

Template.registerHelper('sAgentReportStatus', function() {
  try {
    return this ? this.details.online ?
      '' :
      `
        ${this.details.lastSeen ? i18n.__('s-agent.service.status.lastSeen') : ''}
        ${this.details.lastSeen ? moment(this.details.lastSeen).fromNow() || '-' : ''}
      ` :
      ''
  }
  catch (ex) {
    return ''
  }
})

Template.servicesAgentCommonConfig.helpers({
  registeredAgents: () => {
    return Services.find({type: 'agent'}).map(a => {
      return {
        _id: a._id,
        title: a.title
      }
    })
  },
  files: function () {
    return Files.find()
  }
})