import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import { ExecutionsLogs } from '../both/collection'
Meteor.publish('executionsLogs.all', (query, options) => {
  query.user = Meteor.userId()
  new SimpleSchema({
    user: String,
    execution: String
  }).validate(query)
  return ExecutionsLogs.find(query, options)
})

Meteor.publish('executionsLogs.single', (query, options) => {
  query.user = Meteor.userId()
  new SimpleSchema({
    _id: String,
    user: String
  }).validate(query)
  return ExecutionsLogs.find(query, options)
})