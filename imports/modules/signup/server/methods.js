import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

import { check } from 'meteor/check'

Meteor.methods({
  'membership.create' (userData) {
    check(userData, {
      email: String,
      password: String,
      profile: {
        firstName: String
      }
    })

    const userId = Accounts.createUser(userData)
    Accounts.sendVerificationEmail(userId)
  }
})