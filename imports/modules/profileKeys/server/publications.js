import { Meteor } from 'meteor/meteor'

import { Keys } from '../both/collection'

Meteor.publish('keys.all', function(query) {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.user = Meteor.userId()

  var self = this
  var docs = Keys.find(query).fetch()
  docs.map(doc => {
    doc.key = `${doc.key.substring(0,5)}-****`
    self.added('keys', doc._id, doc)
  })
  self.ready()
})
