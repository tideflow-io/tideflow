import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import { Files } from '../both/collection'
import { isMember } from '../../_common/both/teams'

Meteor.publish('files.all', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  new SimpleSchema({
    team: String
  }).validate(query)

  if (!isMember(Meteor.userId(), query.team)) throw new Meteor.Error('no-access')
  return Files.find(query, options)
})

Meteor.publish('files.single', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  new SimpleSchema({
    _id: String,
    team: String
  }).validate(query)

  if (!isMember(Meteor.userId(), query.team)) throw new Meteor.Error('no-access')
  return Files.find(query, options)
})