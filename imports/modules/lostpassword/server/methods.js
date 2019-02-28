import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

import { check } from 'meteor/check'

Meteor.methods({
  'membership.lostpassword' (user) {
    check(user, {
      email: String
    })

    const userExists = Accounts.findUserByEmail(user.email)

    // Fake it if the user email doesn't exist
    if (!userExists) {
      return true
    }

    Meteor.defer(function() {
      Accounts.sendResetPasswordEmail(userExists._id)
    })
  }
})