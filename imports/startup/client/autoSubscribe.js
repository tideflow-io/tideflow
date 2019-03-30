import { Meteor } from 'meteor/meteor'

Meteor.startup( function() {
  Meteor.subscribe('settings.public.all')
  Meteor.subscribe('services.all', {})
  Meteor.subscribe('flows.all', {
  }, {
    fields: {
      title: true,
      descriptiom: true,
      status: true,
      trigger: true
    }
  })
})