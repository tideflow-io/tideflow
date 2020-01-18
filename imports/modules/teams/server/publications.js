import { Meteor } from 'meteor/meteor'

import { Teams } from '../both/collection.js'

Meteor.publish('teams.all', () => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  return Teams.find({
    'members.user': Meteor.userId()
  }, {})
})
