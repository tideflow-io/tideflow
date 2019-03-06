import { Roles } from 'meteor/alanning:roles'

module.exports.checkRole = (userId, team) => {
  if (!userId) userId = Meteor.userId()
  if (!userId) return false
  return Roles.userIsInRole(Meteor.userId(), team, Roles.GLOBAL_GROUP)
}