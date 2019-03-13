import { Meteor } from 'meteor/meteor'

import { check } from 'meteor/check'

import { checkRole } from '/imports/helpers/both/roles'

import { Settings as SettingsCollection } from "../both/collection"

Meteor.methods({
  'site-settings' (settings) {
    if (!checkRole(Meteor.userId(), 'super-admin')) {
      throw new Meteor.Error('not-allowed')
    }

    check(settings, {
      title: String
    })

    if (settings.title.trim() === '') {
      throw new Meteor.Error('title-empty')
    }

    SettingsCollection.upsert({
      type: 'siteSettings'
    }, {
      $set: {
        public: true,
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
  }
})