import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import { Services } from '../both/collection.js'

Meteor.publish('services.all', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.user = Meteor.userId()
  new SimpleSchema({
    user: String
  }).validate(query)
  return Services.find(query, options)
})

Meteor.publish('services.single', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.user = Meteor.userId()
  new SimpleSchema({
    _id: String,
    user: String
  }).validate(query)
  return Services.find(query, options)
})