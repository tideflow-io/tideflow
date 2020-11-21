import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { checkRole } from '/imports/helpers/both/roles'
import { Settings as SettingsCollection } from '../both/collection'

Meteor.methods({
  'site-settings' (settings) {
    if (!checkRole(Meteor.userId(), 'super-admin')) {
      throw new Meteor.Error('not-allowed')
    }

    check(settings, {
      title: String,
      showTitle: Boolean
    })

    if (settings.title.trim() === '') {
      throw new Meteor.Error('title-empty')
    }

    SettingsCollection.upsert({
      type: 'siteSettings'
    }, {
      $set: {
        public: true,
        'settings.showTitle': settings.showTitle,
        'settings.title': settings.title
      }
    })
  },

  'site-permissions-settings' (settings) {
    if (!checkRole(Meteor.userId(), 'super-admin')) {
      throw new Meteor.Error('not-allowed')
    }

    check(settings, {
      signupsType: String,
      signupsDomain: String,
    })

    SettingsCollection.upsert({
      type: 'siteSettings'
    }, {
      $set: {
        public: true,
        'settings.signupsType': settings.signupsType,
        'settings.signupsDomain': settings.signupsDomain
      }
    })
  },

  'site-permissions-teams' (settings) {
    if (!checkRole(Meteor.userId(), 'super-admin')) {
      throw new Meteor.Error('not-allowed')
    }

    check(settings, {
      creationPermissions: String
    })

    SettingsCollection.upsert({
      type: 'teamsCreation'
    }, {
      $set: {
        public: true,
        'settings.creationPermissions': settings.creationPermissions
      }
    })
  }
})