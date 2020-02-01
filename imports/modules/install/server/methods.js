import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { Roles } from 'meteor/alanning:roles'

import { Settings } from '/imports/modules/management/both/collection'

import { createUsersTeam } from '../../_common/server/teams'
import { ROLES } from '../../_common/both/teams'

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
    if (one) return new Meteor.Error('not-allowed')

    // Create user
    const userInfo = {
      email: details.email,
      password: details.password,
      profile: { firstName: details.userName }
    }
    const userId = Accounts.createUser(userInfo)

    Roles.createRole(ROLES.SUPER, {unlessExists: true})
    Roles.addUsersToRoles(userId, ROLES.SUPER)

    ROLES.map(r => {
      Roles.createRole(r)
    })

    createUsersTeam(Object.assign(userInfo, {_id: userId}))
    
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