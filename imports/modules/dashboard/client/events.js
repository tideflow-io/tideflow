import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'

Template.dashboard.onRendered(function() {
  const instance = this
  Meteor.call('dashboard.executions', {}, {
    limit: 0
  }, (error, result) => {
    if (!error) {
      instance.executions = result
    }
  })
})