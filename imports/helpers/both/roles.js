import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'

module.exports.checkRole = (userId, team, group) => {
  if (!userId) userId = Meteor.userId()
  if (!userId) return false
  return Roles.userIsInRole(Meteor.userId(), team, group || Roles.GLOBAL_GROUP)
}