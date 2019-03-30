import { Meteor } from 'meteor/meteor'

import { Executions } from '/imports/modules/executions/both/collection.js'

Meteor.methods({
  'dashboard.executions': (query, options) => {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')

    let dbQuery = {
      user: Meteor.userId()
    }

    let time = new Date()

    switch (query.time) {
    case 'lastMonth':
      time = new Date(new Date().setDate(new Date().getDate()-31))
      break
    case 'lastWeek':
      time = new Date(new Date().setDate(new Date().getDate()-7))
      break
    case 'last24Hours':
      time = new Date(new Date().setDate(new Date().getDate()-1))
      break
    }

    dbQuery.createdAt = { $gt: time }

    options = Object.assign({
      fileds: {
        createdAt: 1,
        service: 1,
        flow: 1,
        status: 1
      },
      limit: 10,
      reactive: false,
      sort: {
        createdAt: -1
      }
    }, options || {})
    return Executions.find(dbQuery, options).fetch()
  }
})