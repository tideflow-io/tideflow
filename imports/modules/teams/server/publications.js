import { Meteor } from 'meteor/meteor'

import { isMember, isAdmin } from '../../_common/both/teams'
import { Teams } from '../both/collection.js'

Meteor.publish('teams.all', () => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  return Teams.find({
    'members.user': Meteor.userId()
  }, {})
})

Meteor.publish('teamMembers.emails', (query) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  const userIds = query.users
  const teamId = query.team
  if (!isMember(Meteor.userId(), teamId)) throw new Meteor.Error('no-auth')

  return Meteor.users.find({_id: {$in: userIds}}, {
    fields: {
      emails: true
    }
  })
})