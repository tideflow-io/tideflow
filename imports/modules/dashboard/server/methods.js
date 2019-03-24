import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import { Executions } from '/imports/modules/executions/both/collection.js'

Meteor.methods({
  'dashboard.executions': (query, options) => {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    if (!query) query = {}
    query.user = Meteor.userId()
    new SimpleSchema({
      user: String
    }).validate(query)
    options = Object.assign({
      fileds: {
        createdAt: 1,
        channel: 1,
        flow: 1,
        status: 1
      },
      limit: 10,
      reactive: false
    }, options || {})
    return Executions.find(query, options).fetch()
  }
})