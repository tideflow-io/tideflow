import { Session } from 'meteor/session'
import { Template } from 'meteor/templating'

Template.flowsOneExecutionsOneDetails.events({
  'click .logsViewAsToggle': () => {
    return Session.get('logsViewAs') === 'console' ? 
      Session.set('logsViewAs', 'cards') :
      Session.set('logsViewAs', 'console')
  }
})