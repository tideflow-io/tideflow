import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import { Flows } from '../both/collection.js'

Meteor.publish('flows.all', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.user = Meteor.userId()
  new SimpleSchema({
    user: String
  }).validate(query)
  return Flows.find(query, options)
})

Meteor.publish('flows.single', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.user = Meteor.userId()
  new SimpleSchema({
    _id: String,
    user: String
  }).validate(query)
  return Flows.find(query, options)
})