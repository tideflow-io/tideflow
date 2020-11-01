import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { isMember } from '../../_common/both/teams'

import { ExecutionsLogs } from '../both/collection'
Meteor.publish('executionsLogs.all', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  new SimpleSchema({
    team: String,
    execution: String
  }).validate(query)
  if (!isMember(Meteor.userId(), query.team)) throw new Meteor.Error('no-access')
  return ExecutionsLogs.find(query, options)
})

Meteor.publish('executionsLogs.single', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  new SimpleSchema({
    _id: String,
    team: String
  }).validate(query)
  if (!isMember(Meteor.userId(), query.team)) throw new Meteor.Error('no-access')
  return ExecutionsLogs.find(query, options)
})