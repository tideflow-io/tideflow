import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { Roles } from 'meteor/alanning:roles'

import { Settings } from '/imports/modules/management/both/collection'

import { createUsersTeam } from '../../_common/server/teams'
import { ROLES } from '../../_common/both/teams'

import { check } from 'meteor/check'

const debug = require('debug')('tideflow:installation:core')

Meteor.methods({
  'install-platform' (details) {
    debug('Method execution')

    check(details, {
      siteName: String,
      userName: String,
      email: String,
      password: String
    })

    debug('Finding settings...')

    let one = Settings.findOne()
    if (one) return new Meteor.Error('not-allowed')

    debug('Creating user...')

    // Create user
    const userInfo = {
      email: details.email,
      password: details.password,
      profile: { firstName: details.userName }
    }
    const userId = Accounts.createUser(userInfo)

    debug('Creating roles...')

    Object.keys(ROLES).map(r => {
      Roles.createRole(ROLES[r], {unlessExists: true})
    })
    Roles.addUsersToRoles(userId, ROLES.SUPER)

    debug('Creating team...')

    createUsersTeam(Object.assign(userInfo, {_id: userId}))
    
    // Verify email automatically
    debug('Verifying user email...')
    Meteor.users.update({_id:userId}, {$set:{'emails.0.verified': true}})

    // Store settings
    debug('Update site settings...')
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