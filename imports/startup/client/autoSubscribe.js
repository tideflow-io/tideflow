import { Meteor } from 'meteor/meteor'

Meteor.startup( function() {
  Meteor.subscribe('settings.public.all')
})