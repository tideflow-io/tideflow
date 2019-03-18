import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import { ServiceDataTableRecords } from '../both/collection.js'

Meteor.publish('servicesDatatableRows.all', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.user = Meteor.userId()
  new SimpleSchema({
    user: String,
    channel: String
  }).validate(query)
  return ServiceDataTableRecords.find(query, options)
})

Meteor.publish('servicesDatatableRows.single', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.user = Meteor.userId()
  new SimpleSchema({
    _id: String,
    user: String
  }).validate(query)
  return ServiceDataTableRecords.find(query, options)
})