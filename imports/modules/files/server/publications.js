import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import { Files } from '../both/collection.js'

Meteor.publish('files.all', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.userId = Meteor.userId()
  new SimpleSchema({
    userId: String
  }).validate(query)
  console.log({query, r: Files.find(query, options)})
  return Files.find(query, options).cursor
})

Meteor.publish('files.single', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.userId = Meteor.userId()
  new SimpleSchema({
    _id: String,
    userId: String
  }).validate(query)
  return Files.find(query, options).cursor
})