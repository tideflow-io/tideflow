import { Teams } from '/imports/modules/teams/both/collection'
import { isMember } from '../both/teams'

const removeUser = (user, team) => {
  let fullTeam = team._id ? team : Teams.findOne({_id: team})
  if (!fullTeam) return false

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
  let userId = user._id || user

  let fullTeam = team._id ? team : Teams.findOne({_id: team})
  if (!fullTeam) return null

  let userIsMember = isMember(user, fullTeam)

  if (userIsMember) {
    return Teams.update({
      _id: fullTeam._id,
      'members.user': userId
    }, {
      $set: {
        'members.$.role': role
      }
    })
  }
  else {
    return Teams.update({_id: fullTeam._id}, {
      $addToSet: {
        members: {
          user: userId,
          role: role
        }
      }
    })
  }
}

module.exports.setRole = setRole