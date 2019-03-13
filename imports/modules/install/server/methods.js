import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { Roles } from 'meteor/alanning:roles'

import { pick } from '/imports/helpers/both/objects'
import { Settings } from '/imports/modules/management/both/collection'
import * as settingsHelper from '/imports/helpers/server/settings'

import { check } from 'meteor/check'

Meteor.methods({
  'install-platform' (details) {
    check(details, {
      siteName: String,
      userName: String,
      email: String,
      password: String
    })

    let one = Settings.findOne()
    if (one) {
      return new Meteor.Error('not-allowed')
    }

    // Create user
    const userId = Accounts.createUser({
      email: details.email,
      password: details.password,
      profile: { firstName: details.userName }
    })

    Roles.addUsersToRoles(userId, 'super-admin', Roles.GLOBAL_GROUP)

    // Verify email automatically
    Meteor.users.update({_id:userId}, {$set:{'emails.0.verified': true}})

    // Store settings
    Settings.update({
      public: true,
      type: 'siteSettings'
    }, {
      $set: {
        public: true,
        type: 'siteSettings',
        'settings.signupsType': 'public',
        'settings.title': details.siteName
      }
    }, {
      upsert: true
    })
  }
})