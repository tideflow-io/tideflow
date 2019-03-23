import { Meteor } from 'meteor/meteor'
import SimpleSchema from "simpl-schema"

import { Channels } from '../both/collection'
import { ValidatedMethod } from "meteor/mdg:validated-method"

import { channels as channelsHooks } from '/imports/services/_root/server'
import { pick } from '/imports/helpers/both/objects'

import schema from '../both/schemas/schema'

export const createChannel = new ValidatedMethod({
  name: 'channels.create',
  validate: schema.validator(),
  run(channel) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    channel.user = Meteor.userId()

    channel = channelsHooks.create.pre(channel)
    Channels.insert(channel)
    channelsHooks.create.post(channel)
    return pick(channel, ['_id', 'type'])
  }
})

export const updateChannel = new ValidatedMethod({
  name: 'channels.update',
  validate: schema.validator(),
  run(channel) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')

    const UPDATABLE_PROPERTIES = ['title', 'description', 'details', 'config']

    let originalChannel = Channels.findOne({_id: channel._id})

    let newChannelProperties = {}
    UPDATABLE_PROPERTIES.map(p => { newChannelProperties[p] = channel[p] })

    let afterPreHookDoc = channelsHooks.update.pre(originalChannel, Object.assign({}, originalChannel, newChannelProperties))
    if (!afterPreHookDoc) {
      throw new Error('Channel pre-update hook failed')
    }

    let propertiesToUpdate = {}
    UPDATABLE_PROPERTIES.map(p => { propertiesToUpdate[p] = afterPreHookDoc[p] })

    Channels.update(
      { _id: channel._id },
      { $set: propertiesToUpdate }
    )

    channelsHooks.update.post(originalChannel, afterPreHookDoc)
  }
})

export const deleteChannel = new ValidatedMethod({
  name: 'channels.delete',
  validate: new SimpleSchema({ _id: { type: String } }).validator(),
  run(channel) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    
    let originalChannel = Channels.findOne({_id: channel._id})
    let docToDelete = channelsHooks.delete.pre(originalChannel)
    if (!docToDelete) {
      throw new Error('Deletion hook failed')
    }

    Channels.remove(channel._id)

    channelsHooks.delete.post(docToDelete)
  }
})