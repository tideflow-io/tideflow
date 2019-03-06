import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

import { Settings } from '/imports/modules/management/both/collection'
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

    const allow = settingsHelper.getOne('siteSettings', 'allowSignups')

    if (!allow) {
      throw new Meteor.Error('not-allowed')
    }

    const userId = Accounts.createUser(userData)
    Accounts.sendVerificationEmail(userId)
  }
})