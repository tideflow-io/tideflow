import { Meteor } from 'meteor/meteor'

import { FilesTemplates } from '../both/collection'

Meteor.publish('filesTemplates.all', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  return FilesTemplates.find(query, options)
})

Meteor.publish('filesTemplates.single', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  return FilesTemplates.find(query, options)
})
