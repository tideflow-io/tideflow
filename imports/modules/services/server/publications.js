import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import { Services } from '../both/collection'
import { isMember } from '../../_common/both/teams'

Meteor.publish('services.all', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  new SimpleSchema({
    team: String
  }).validate(query)

  if (!isMember(Meteor.userId(), query.team)) throw new Meteor.Error('no-access')
  return Services.find(query, options)
})

Meteor.publish('services.single', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  new SimpleSchema({
    _id: String,
    team: String
  }).validate(query)

  if (!isMember(Meteor.userId(), query.team)) throw new Meteor.Error('no-access')
  return Services.find(query, options)
})