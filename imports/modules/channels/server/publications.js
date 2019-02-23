import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import { Channels } from '../both/collection.js'

Meteor.publish('channels.all', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.user = Meteor.userId()
  new SimpleSchema({
    user: String
  }).validate(query)
  return Channels.find(query, options)
})

Meteor.publish('channels.single', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.user = Meteor.userId()
  new SimpleSchema({
    _id: String,
    user: String
  }).validate(query)
  return Channels.find(query, options)
})