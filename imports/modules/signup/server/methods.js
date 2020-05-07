import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

import * as settingsHelper from '/imports/helpers/server/settings'

import { Teams } from '/imports/modules/teams/both/collection'
import { setRole } from '../../_common/server/teams'
import { ROLES } from '../../_common/both/teams'

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

    // Check system default teams and join automatically
    const defaultTeams = Teams.find({systemDefault:true})
    defaultTeams.forEach(defaultTeam => {
      return setRole(userId, defaultTeam, ROLES.MEMBER)
    });

    Accounts.sendVerificationEmail(userId)
  }
})