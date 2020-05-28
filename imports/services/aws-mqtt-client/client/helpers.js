import { Template } from 'meteor/templating'

import { Services } from '/imports/modules/services/both/collection'

Template.servicesAwsCommonConfig.helpers({
  registeredProfiles: () => {
    return Services.find({type: 'aws'}).map(a => {
      return {
        _id: a._id,
        title: a.title
      }
    })
  }
})

Template.registerHelper('sAwsMqttClientReportStatusDot', function() {
  try {
    return this ? this.details.online ?
      '<div class="s-aws-mqtt-client-status-dot online"></div>' :
      '<div class="s-aws-mqtt-client-status-dot offline"></div>' :
      ''
  }
  catch (ex) {
    return ''
  }
})

Template.registerHelper('sAwsMqttClientReportStatus', function() {
  try {
    return this ? this.details.online ?
      '' :
      `
        ${i18n.__('s-aws-mqtt-client.service.status.lastConnected')}
        ${moment(this.details.lastSeen).fromNow() || '-'}
      ` :
      ''
  }
  catch (ex) {
    return ''
  }
})