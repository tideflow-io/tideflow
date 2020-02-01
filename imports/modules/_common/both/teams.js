import { Teams } from '/imports/modules/teams/both/collection'

const matchRole = (user, team, role) => {
  let userId = user._id || user
  let fullTeam = team._id ? team : Teams.findOne({_id: team})
  if (!fullTeam) throw 'no-team'
  if (fullTeam && fullTeam.members) {
    return !!fullTeam.members.find(m => m.user === userId && role ? m.role === role : true)
  }
  return false
}

const isMember = (user, team) => {
  return matchRole(user, team)
}

module.exports.isMember = isMember

const isAdmin = (user, team) => {
  return matchRole(user, team, 'admin')
}

module.exports.isAdmin = isAdmin
