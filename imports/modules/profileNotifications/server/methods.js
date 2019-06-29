import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

import * as settingsHelper from '/imports/helpers/server/settings'

import { check } from 'meteor/check'

Meteor.methods({
  'profileNotifications.update' (preferences) {
    check(preferences, {
      myExecutions: {
        schedule: String
      }
    })

    Meteor.users.update({ _id: Meteor.userId() }, {
			$set:{
				'profile.notifications': preferences
			}
		});
  }
})