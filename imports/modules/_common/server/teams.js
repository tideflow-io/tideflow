import { Roles } from 'meteor/alanning:roles'

import { Teams } from '/imports/modules/teams/both/collection'

const ROLES = {
  MEMBER: 'member',
  MANAGER: 'manager',
  ADMIN: 'admin',
  SUPER: 'super-admin'
}

module.exports.ROLES = ROLES

/**
 * 
 * @param {Object} user A user, as stored in database
 */
const userTeamName = user => {
  if (!user) return 'Team'
  if (user.profile && user.profile.firstName)
    return `${user.profile.firstName || 'User'}'s Team`

  return 'User\'s team'
}

/**
 * 
 * @param {*} user 
 * @param {*} teamName 
 */
const createUsersTeam = (user, teamName) => {
  if (!teamName) teamName = userTeamName(user)
  Roles.addUsersToRoles(user._id, ROLES.ADMIN, teamName)
}

module.exports.createUsersTeam = createUsersTeam

const matchRole = (user, team, role) => {
  let userId = user._id || user
  let fullTeam = team._id ? team : Teams.findOne({_id: team})
  if (!fullTeam) throw 'no-team'
  if (fullTeam && fullTeam.members) {
    return !!fullTeam.members.find(m => m.user === userId && role ? m.role === role : true)
  }
  return false
}

module.exports.matchRole = matchRole

const isMember = (user, team) => {
  return matchRole(user, team)
}

module.exports.isMember = isMember

const isAdmin = (user, team) => {
  return matchRole(user, team, 'admin')
}

module.exports.isAdmin = isAdmin

const removeUser = (user, team) => {
  let fullTeam = team._id ? team : Teams.findOne({_id: team})
  if (!fullTeam) throw 'no-team'

  let userId = user._id || user

  let userIsMember = isMember(user, fullTeam)

  if (!userIsMember) throw 'member-not-found'

  return Teams.update({_id: fullTeam._id}, {
    $pull: {
      members: {
        user: userId
      }
    }
  })
}

module.exports.removeUser = removeUser

const setRole = (user, team, role) => {
  let fullTeam = team._id ? team : Teams.findOne({_id: team})
  if (!fullTeam) throw 'no-team'

  let userIsMember = isMember(user, fullTeam)

  if (userIsMember) {
    Teams.update({
      _id: team,
      'members.user': user
    }, {
      $set: {
        'members.$.role': role
      }
    })
  }
  else {
    Teams.update({_id: team}, {
      $addToSet: {
        members: {
          user: user,
          role: role
        }
      }
    })
  }
}

module.exports.setRole = setRole