import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'

import { Teams } from '/imports/modules/teams/both/collection'
import { Executions } from '/imports/modules/executions/both/collection'
import { ExecutionsLogs } from '/imports/modules/executionslogs/both/collection'
import { Files } from '/imports/modules/files/both/collection'
import { Flows } from '/imports/modules/flows/both/collection'
import { Services } from '/imports/modules/services/both/collection'

import filesLib from '/imports/modules/files/server/lib'

import { getSetting } from '../../management/both/settings'
import { checkRole } from '../../../helpers/both/roles'
import { isMember, isAdmin } from '../../_common/both/teams'
import { setRole, removeUser } from '../../_common/server/teams'

import { ROLES } from '../../_common/both/teams'

const slugify = require('slugify')

Meteor.methods({
  'teams.create' (teamData) {
    if (!Meteor.userId()) throw new Meteor.Error('teams.create.form.errors.no-auth')

    const isSuperAdmin = checkRole(Meteor.userId(), 'super-admin')

    if (!isSuperAdmin
      && getSetting('teamsCreation', 'creationPermissions') !== 'public') {
      throw new Meteor.Error('teams.create.form.errors.not-allowed')
    }

    check(teamData, {
      name: String
    })

    let { name } = teamData

    name = name.trim()
    let slug = slugify(name)

    if (name.length < 3) throw new Meteor.Error('teams.create.form.errors.name-too-short') 

    let existingTeam = Teams.findOne({$or:[
      { name },
      { slug }
    ]})

    if (existingTeam) throw new Meteor.Error('teams.create.form.errors.already-exists')

    // Check if there's any other group created.
    // If there's none, then the new group will be the default one.
    let groupIsDefault = false
    if (isSuperAdmin) {
      let existingGroups = Teams.find().count()
      if (!existingGroups) groupIsDefault = true
    }
    
    // Check if group already exists
    return Teams.insert({
      name,
      slug,
      systemDefault: groupIsDefault,
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

    name = name.trim()
    let slug = slugify(name)

    // Check if group already exists
    return Teams.update({ _id }, {
      $set: {
        name, slug
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
    return setRole(user, existingTeam, ROLES.MEMBER)
  },
  'teamMember.remove' (teamId, userId) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    check(teamId, String)
    check(userId, String)

    if (userId === Meteor.userId()) {
      throw new Meteor.Error('teams.members.delete.errors.notmyself')
    }

    let existingTeam = Teams.findOne({ _id: teamId })
    if (!existingTeam) throw new Meteor.Error('teams.members.delete.errors.team-not-found')

    if (!isAdmin(Meteor.userId(), existingTeam)) {
      throw new Meteor.Error('teams.members.delete.errors.not-authorized')
    }

    if (!isMember(userId, existingTeam)) {
      throw new Meteor.Error('teams.members.delete.errors.member-not-found')
    }

    return removeUser(userId, teamId)
  },
  'teams.delete' (groupQuery) {
    if (!checkRole(Meteor.userId(), 'super-admin')) {
      throw new Meteor.Error('no-auth')
    }

    const { _id } = groupQuery

    if (!_id) throw new Meteor.Error('bad-query')

    // Get team details
    const currentTeam = Teams.findOne({_id})

    // Do not allow to remove system's default teams
    if (currentTeam.systemDefault) {
      throw new Meteor.Error('team-is-system-default')
    }

    const deleteQuery = {team:_id}

    // Get list of gridFS files to be removed
    const files = Files.find(deleteQuery).fetch()
    let gfsIds = []
    files.forEach(file => {
      file.versions.map(v => gfsIds.push(v.gfsId))
    })

    // Remove gridfs files
    filesLib.remove(gfsIds)

    // Perform remove operations in the rest of collections
    Files.remove(deleteQuery)
    Executions.remove(deleteQuery)
    ExecutionsLogs.remove(deleteQuery)
    Flows.remove(deleteQuery)
    Services.remove(deleteQuery)
    Teams.remove({_id})
  },
  'teams.toggleDefault' (_id, makeDefault) {
    if (!checkRole(Meteor.userId(), 'super-admin')) {
      throw new Meteor.Error('no-auth')
    }

    // User want to set group as non-default
    if (!makeDefault) {
      // Check if there are other system default teams
      let otherDefaultTeams = Teams.findOne({
        systemDefault: true,
        _id: { $ne: _id }
      })

      // There are not other default groups
      if (!otherDefaultTeams) {
        throw new Meteor.Error('no-others')
      }

      Teams.update({_id}, {
        $set: { systemDefault: false }
      })
    }

    // User want to set group as default
    else {
      Teams.update({_id}, {
        $set: { systemDefault: true }
      })
    }
  }
})