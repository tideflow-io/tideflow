import { Meteor } from 'meteor/meteor'

import { check } from 'meteor/check'

const cronConverter = require('cron-converter')

Meteor.methods({
  's-cron-validate' (value) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    
    check(value, String)
    
    try {
      return !!new cronConverter().fromString(value)
    }
    catch (ex) {
      return false
    }
  }
})