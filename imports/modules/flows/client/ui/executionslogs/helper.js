import { Template } from 'meteor/templating'

Template.flowsOneExecutionsOneDetails.helpers({
  viewAsToggleText: () => {
    return Session.get('logsViewAs') === 'console' ? 
    i18n.__('flows.executiondetails.logsViewAs.cards') :
    i18n.__('flows.executiondetails.logsViewAs.console')
  }
})