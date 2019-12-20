import { Session } from 'meteor/session'
import { Template } from 'meteor/templating'
import i18n from 'meteor/universe:i18n'

Template.flowsOneExecutionsOneDetails.helpers({
  viewAsToggleText: () => {
    return Session.get('logsViewAs') === 'console' ? 
      i18n.__('flows.executiondetails.logsViewAs.cards') :
      i18n.__('flows.executiondetails.logsViewAs.console')
  }
})