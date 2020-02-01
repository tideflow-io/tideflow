import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'

import { Teams } from '/imports/modules/teams/both/collection'

import { getSetting } from '../../management/both/settings'
import { checkRole } from '../../../helpers/both/roles'
import { isMember, isAdmin } from '../../_common/both/teams'
import { setRole, removeUser } from '../../_common/server/teams'

const slugify = require('slugify')

Meteor.methods({
  'teams.create' (teamData) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')

    if (!checkRole(Meteor.userId(), 'super-admin')
      && getSetting('teamsCreation', 'creationPermissions') !== 'public') {
      throw new Meteor.Error('not-allowed')
    }

    check(teamData, {
      name: String
    })

    let { name } = teamData

    name = name.trim()
    let slug = slugify(name)

    if (name.length < 5) throw new Meteor.Error('name-too-short') 

    let existingTeam = Teams.findOne({$or:[
      { name },
      { slug }
    ]})

    if (existingTeam) throw new Meteor.Error('already-exists')
    
    // Check if group already exists
    return Teams.insert({
      name,
      slug,
      user: Meteor.userId(),
      members: [{
        user: Meteor.userId(),
        role: 'admin'
      }]
    })
  },
  'team.update' (teamData) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    check(teamData, {
      _id: String,
      name: String
    })

    let { name, _id } = teamData

    let currentTeam = Teams.findOne({ _id })
    if (!currentTeam) throw new Meteor.Error('not-found')

    if (!isAdmin(Meteor.userId(), currentTeam)) {
      throw new Meteor.Error('not-authorized')
    }

    let existingTeam = Teams.findOne({ name, _id: { $ne: _id } })
    if (existingTeam) throw new Meteor.Error('already-exists')

    // Check if group already exists
    return Teams.update({ _id }, {
      $set: {
        name
      }
    })
  },
  'teamMember.switchRole' (teamId, user, newRole) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    check(teamId, String)
    check(user, String)
    check(newRole, String)

    if (user === Meteor.userId()) {
      throw new Meteor.Error('teams.members.switch.errors.notmyself')
    }

    let existingTeam = Teams.findOne({ _id: teamId })
    if (!existingTeam) throw new Meteor.Error('not-found')

    if (!isAdmin(Meteor.userId(), existingTeam)) {
      throw new Meteor.Error('not-authorized')
    }

    return setRole(user, teamId, newRole)
  },
  'teamMember.add' (teamId, userEmail) {
    if (!Meteor.userId()) throw new Meteor.Error('teams.members.add.errors.no-auth')
    check(teamId, String)
    check(userEmail, String)

    let user = Meteor.users.findOne({
      'emails.address': userEmail,
      'emails.verified': true
    })

    if (!user) {
      throw new Meteor.Error('teams.members.add.errors.user-not-found')
    }

    let existingTeam = Teams.findOne({ _id: teamId })
    if (!existingTeam) throw new Meteor.Error('teams.members.add.errors.team-not-found')

    if (!isAdmin(Meteor.userId(), existingTeam)) {
      throw new Meteor.Error('teams.members.add.errors.not-authorized')
    }
    
    return setRole(user._id, existingTeam, 'member')
  },
  'teamMember.remove' (teamId, userId) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    check(teamId, String)
    check(userId, String)

    let existingTeam = Teams.findOne({ _id: teamId })
    if (!existingTeam) throw new Meteor.Error('team-not-found')

    if (!isAdmin(Meteor.userId(), existingTeam)) {
      throw new Meteor.Error('not-authorized')
    }

    if (!isMember(userId, existingTeam)) {
      throw new Meteor.Error('member-not-found')
    }

    return removeUser(userId, teamId)
  }
})