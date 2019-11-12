import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'

/**
 * Check if a user is part of a team/group.
 * 
 * @param {String} userId 
 * @param {String} team 
 * @param {String} group 
 */
module.exports.checkRole = (userId, team, group) => {
  if (!userId) userId = Meteor.userId()
  if (!userId) return false
  return Roles.userIsInRole(userId, team, group || Roles.GLOBAL_GROUP)
}
