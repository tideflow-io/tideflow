import { Template } from 'meteor/templating'

Template['membership.profile.notifications'].helpers({
  myExecutions: function() {
    try {
      return Meteor.user().profile.notifications.myExecutions
    }
    catch (ex) {
      return {}
    }
  }
})