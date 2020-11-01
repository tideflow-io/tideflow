import { Meteor } from 'meteor/meteor'
import { ReactiveAggregate } from 'meteor/tunguska:reactive-aggregate';
import SimpleSchema from 'simpl-schema'

import { Flows } from '../both/collection'
import { Executions } from '../../executions/both/collection'
import { isMember } from '../../_common/both/teams'

Meteor.publish('flows.all', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  new SimpleSchema({
    team: String
  }).validate(query)

  if (!isMember(Meteor.userId(), query.team)) throw new Meteor.Error('no-access')
  return Flows.find(query, options)
})

Meteor.publish('flows.single', (query, options) => {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')
  new SimpleSchema({
    _id: String,
    team: String
  }).validate(query)

  if (!isMember(Meteor.userId(), query.team)) throw new Meteor.Error('no-access')
  return Flows.find(query, options)
})

Meteor.publish('flows.one.executionsStats', function(query, options) {
  if (!Meteor.userId()) throw new Meteor.Error('no-auth')

  new SimpleSchema({
    flow: String,
    team: String
  }).validate(query)

  if (!isMember(Meteor.userId(), query.team)) throw new Meteor.Error('no-access')

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