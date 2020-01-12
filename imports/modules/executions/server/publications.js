import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import { Executions } from '../both/collection.js'

Meteor.publish('executions.all', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.user = Meteor.userId()
  new SimpleSchema({
    user: String,
    flow: String,
    createdAt: {
      type: Object,
      blackbox: true,
      optional: true
    },
    updatedAt: {
      type: Object,
      blackbox: true,
      optional: true
    }
  }).validate(query)
  return Executions.find(query, options)
})

Meteor.publish('executions.single', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.user = Meteor.userId()
  new SimpleSchema({
    _id: String,
    user: String
  }).validate(query)
  return Executions.find(query, options)
})