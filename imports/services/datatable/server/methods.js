import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import slugs from '/imports/helpers/server/slugs'

import { Channels } from '/imports/modules/channels/both/collection'
import { triggerFlows } from '/imports/queue/server'

import { ServiceDataTableRecords } from '../both/collection'

const checkPermissions = (details, channel) => {
  if (!Meteor.userId()) return false
  if (!channel) return false
  if (!details.channel || details.channel !== channel._id) return false
  if (channel.user !== Meteor.userId()) return false
  return true
}

Meteor.methods({
  's-datatable-record-add' (details) {
    check(details, {
      channel: String,
    })
    
    const channel = Channels.findOne({_id: details.channel})

    if (!checkPermissions(details, channel)) {
      throw new Meteor.Error('no-auth')
    }

    const nextCardinality = channel.config ? channel.config.cardinality ?
      channel.config.cardinality+1 : 1 : 1

    ServiceDataTableRecords.insert({
      user: Meteor.userId(),
      channel: channel._id,
      cardinality: nextCardinality,
      data: {}
    })

    Channels.update(
      {_id: channel._id},
      { $set: {
        'config.cardinality': nextCardinality
      } }
    )
  },

  's-datatable-columns-add' (details) {
    check(details, {
      channel: String,
      column: String,
    })

    const channel = Channels.findOne({_id: details.channel})

    if (!checkPermissions(details, channel)) {
      throw new Meteor.Error('no-auth')
    }

    const existingSlugs = channel.config.headers.map(h => h.name)

    Channels.update({
      user: Meteor.userId(),
      _id: channel._id
    }, {
      $push: {
        'config.headers': {
          name : slugs.generateSlug(details.column, existingSlugs),
          label : details.column,
          type : 'string'
        }
      }
    })
  },

  's-datatable-column-remove' (details) {
    check(details, {
      channel: String,
      column: String,
    })
    
    const channel = Channels.findOne({_id: details.channel})

    if (!checkPermissions(details, channel)) {
      throw new Meteor.Error('no-auth')
    }

    let unsetData = {}
    unsetData[details.column] = ''

    ServiceDataTableRecords.update({
      user: Meteor.userId(),
      channel: channel._id
    }, {
      $unset: unsetData
    }, {multi: true})

    Channels.update({_id: details.channel}, {
      $pull: { 'config.headers': { name: details.column } }
    })
  },

  's-datatable-column-rename' (details) {
    check(details, {
      channel: String,
      column: String,
      label: String
    })
    
    const channel = Channels.findOne({_id: details.channel})

    if (!checkPermissions(details, channel)) {
      throw new Meteor.Error('no-auth')
    }

    Channels.update({
      user: Meteor.userId(),
      _id: channel._id,
      'config.headers.name': details.column
    }, {
      $set: {
        'config.headers.$.label': details.label
      }
    })
  },

  's-datatable-record-edit' (details) {
    check(details, {
      channel: String,
      column: String,
      record: String,
      value: String
    })
    
    const channel = Channels.findOne({_id: details.channel})
    
    if (!checkPermissions(details, channel)) {
      throw new Meteor.Error('no-auth')
    }

    let executeUpdate = Meteor.wrapAsync((cb) => {
      let update = {}
      update[`data.${details.column}`] = details.value

      ServiceDataTableRecords.rawCollection().findAndModify(
        {
          user: Meteor.userId(),
          channel: channel._id,
          _id: details.record
        },
        [],
        { $set: update },
        { new: true },
        cb)
    })

    let newRecord = executeUpdate().value

    let user = Meteor.users.findOne({_id: channel.user}, {
      fields: { services: false }
    })
  
    if (!user) {
      return null
    }

    let data = [{
      type: 'object',
      data: Object.assign({ id: newRecord.cardinality }, newRecord.data)
    }]

    triggerFlows(
      channel,
      user,
      {
        'trigger._id': channel._id,
        'trigger.event': 'record-update'
      },
      data
    )
  },

  's-datatable-record-remove' (details) {
    check(details, {
      channel: String,
      _id: String
    })
    
    const channel = Channels.findOne({_id: details.channel})
    
    if (!checkPermissions(details, channel)) {
      throw new Meteor.Error('no-auth')
    }

    ServiceDataTableRecords.remove({
      channel: channel._id,
      _id: details._id
    })
  },
})