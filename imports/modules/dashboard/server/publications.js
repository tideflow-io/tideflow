import { Meteor } from 'meteor/meteor'
import { ReactiveAggregate } from 'meteor/tunguska:reactive-aggregate'
import { moment } from 'meteor/momentjs:moment'

import { Executions } from '../../executions/both/collection'

Meteor.publish('dashboard.executionsStats', function(query, options) {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')

  query.user = Meteor.userId()

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

  query.createdAt = { $gt: time }
  delete query.time

  var pipeline = [
    {
      $match: query,
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

  ReactiveAggregate(this, Executions, pipeline, {
    clientCollection: 'executionsStats',
    debounceDelay: 1000
  })
})