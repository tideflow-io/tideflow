import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'

Template['membership.profile.index'].helpers({
  user: function() {
    return Meteor.user()
  }
})