import { Template } from 'meteor/templating'

Template['membership.profile.edit'].helpers({
  user: function() {
    return Meteor.user()
  }
})