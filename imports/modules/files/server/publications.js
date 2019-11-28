import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import { Files } from '../both/collection.js'

Meteor.publish('files.all', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.user = Meteor.userId()
  new SimpleSchema({
    user: String
  }).validate(query)
  return Files.find(query, options)
})

Meteor.publish('files.single', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.user = Meteor.userId()
  new SimpleSchema({
    _id: String,
    user: String
  }).validate(query)
  let result = Files.find(query, options)
  return result
})