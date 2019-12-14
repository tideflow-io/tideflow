import { Meteor } from 'meteor/meteor'

import { FilesTemplatesCategories } from '../both/collection.js'

Meteor.publish('filesTemplatesCategories.all', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  return FilesTemplatesCategories.find(query, options)
})

Meteor.publish('filesTemplatesCategories.single', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  return FilesTemplatesCategories.find(query, options)
})
