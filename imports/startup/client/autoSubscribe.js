import { Meteor } from 'meteor/meteor'

Meteor.startup( function() {
  console.log('123')
  Meteor.subscribe('settings.public.all')
  Meteor.subscribe('channels.all', {})
  Meteor.subscribe('flows.all', {
  }, {
    fields: {
      title: true,
      descriptiom: true,
      status: true,
      'trigger.type': true,
      'trigger.event': true,
      'trigger.config.cron': true
    }
  })
})