import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

Meteor.methods({
  'profile.password.recover' () {
    return Accounts.sendResetPasswordEmail(Meteor.userId())
  },
  'profile.update' (doc) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    
    return Meteor.users.update(
      doc._id,
      {
        $set: {
          'profile.firstName': doc.modifier.$set['profile.firstName'],
          'profile.lastName': doc.modifier.$set['profile.lastName'],
          'profile.address': doc.modifier.$set['profile.address'],
          'profile.city': doc.modifier.$set['profile.city'],
          'profile.region': doc.modifier.$set['profile.region'],
          'profile.country': doc.modifier.$set['profile.country'],
          'profile.postbox': doc.modifier.$set['profile.postbox'],
          'profile.taxId': doc.modifier.$set['profile.taxId'],
          'profile.currency': doc.modifier.$set['profile.currency']
        }
      },
      function(error, result) {
        if (error) {
          throw new Meteor.Error(500, "Server error")
        }
      }
    )

  }
})