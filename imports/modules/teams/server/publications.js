import { Meteor } from 'meteor/meteor'

import { isMember, isAdmin } from '../../_common/both/teams'
import { Teams } from '../both/collection'
import { checkRole } from '/imports/helpers/both/roles'

Meteor.publish('teams.all', () => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')

  if (!checkRole(Meteor.userId(), 'super-admin')) {
    return Teams.find({
      'members.user': Meteor.userId()
    }, {})
  }

  return Teams.find({}, {})
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