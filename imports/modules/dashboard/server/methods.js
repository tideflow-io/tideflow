import { Meteor } from 'meteor/meteor'
import { moment } from 'meteor/momentjs:moment'

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
      time = moment().subtract(1, 'month').startOf('month').toDate()
      break
    case 'lastWeek':
      time = moment().subtract(7, 'days').toDate()
      break
    case 'last24Hours':
      time = moment().subtract(24, 'hours').toDate()
      break
    }

    dbQuery.createdAt = { $gt: time }

    var pipeline = [
      {
        $match: dbQuery,
      },
      {
        $group: {
          _id: {flow: '$flow', status: '$status'},
          count: {$sum:1}
        }
      },
      {
        $group: {
          _id: {flow: '$_id.flow'},
          result: {$push: {status: '$_id.status', count: '$count'}}
        }
      },
      { $replaceRoot: { newRoot: {
        _id: '$_id.flow',
        result: '$result'
      } } }
    ]

    return Meteor.wrapAsync(cb => {
      var rawCollection = Executions.rawCollection()
      rawCollection.aggregate(pipeline, async (error, result) => {
        return error ? cb(error) : cb(null, await result.toArray())
      })
    })()
  }
})