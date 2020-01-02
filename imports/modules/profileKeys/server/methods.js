const uuidv4 = require('uuid/v4')

import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'

import { Keys } from '../both/collection.js'

Meteor.methods({
  'profileKeys.create' () {
    const key = uuidv4()
    Keys.insert({
      user: Meteor.userId(),
      key
    })
    return key
  },
  'profileKeys.remove' (key) {
    check(key, {
      _id: String
    })
    Keys.remove({
      user: Meteor.userId(),
      _id: key._id
    })
    return 'ok'
  }
})