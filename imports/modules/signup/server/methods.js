import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

import * as settingsHelper from '/imports/helpers/server/settings'

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

    const siteSettings = settingsHelper.getOne('siteSettings')

    if (siteSettings.signupsType === 'none') {
      throw new Meteor.Error('not-allowed')
    }
    else if (siteSettings.signupsType === 'domain') {
      const email = userData.email
      const domain = email.split('@')[1] || ''
      if (domain !== siteSettings.signupsDomain) {
        throw new Meteor.Error('not-allowed')
      }
    }

    const userId = Accounts.createUser(userData)
    Accounts.sendVerificationEmail(userId)
  }
})