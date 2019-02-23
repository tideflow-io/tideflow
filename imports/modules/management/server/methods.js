import { Meteor } from 'meteor/meteor'

import { check } from 'meteor/check'

import { Settings as SettingsCollection } from "../both/collection"

Meteor.methods({
  'site-settings' (settings) {
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
        settings
      }
    })
  }
})