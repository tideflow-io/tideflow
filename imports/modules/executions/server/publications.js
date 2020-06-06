import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import { Executions } from '../both/collection'
import { isMember } from '../../_common/both/teams'

Meteor.publish('executions.all', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  if (!isMember(Meteor.userId(), query.team)) throw new Meteor.Error('no-access')
  new SimpleSchema({
    team: String,
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
  if (!isMember(Meteor.userId(), query.team)) throw new Meteor.Error('no-access')
  new SimpleSchema({
    _id: String,
    team: String
  }).validate(query)
  return Executions.find(query, options)
})