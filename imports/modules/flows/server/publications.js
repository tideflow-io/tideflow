import { Meteor } from 'meteor/meteor'
import { ReactiveAggregate } from 'meteor/tunguska:reactive-aggregate';
import SimpleSchema from 'simpl-schema'

import { Flows } from '../both/collection.js'
import { Executions } from '../../executions/both/collection'

Meteor.publish('flows.all', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.user = Meteor.userId()
  new SimpleSchema({
    user: String
  }).validate(query)
  return Flows.find(query, options)
})

Meteor.publish('flows.single', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  query.user = Meteor.userId()
  new SimpleSchema({
    _id: String,
    user: String
  }).validate(query)
  return Flows.find(query, options)
})

Meteor.publish('flows.one.executionsStats', function(query, options) {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')

  query.user = Meteor.userId()

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