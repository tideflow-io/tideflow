import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import { Files } from '../both/collection.js'
import { isMember } from '../../_common/server/teams'

Meteor.publish('files.all', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.user = Meteor.userId()
  new SimpleSchema({
    team: String
  }).validate(query)

  if (!isMember(query.user, query.team)) throw new Meteor.Error('no-access')
  return Files.find(query, options)
})

Meteor.publish('files.single', (query, options) => {
  console.log({query})
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.user = Meteor.userId()
  new SimpleSchema({
    _id: String,
    team: String
  }).validate(query)

  if (!isMember(query.user, query.team)) throw new Meteor.Error('no-access')
  return Files.find(query, options)
})