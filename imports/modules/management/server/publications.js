import { Meteor } from 'meteor/meteor'

import { Settings } from '../both/collection.js'

Meteor.publish('settings.public.all', () => {
  return Settings.find({public: true})
})
