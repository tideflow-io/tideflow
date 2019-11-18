import SimpleSchema from 'simpl-schema'

import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { Meteor } from 'meteor/meteor'
import { sAlert } from 'meteor/juliancwirko:s-alert'
import i18n from 'meteor/universe:i18n'

const mime = require('mime-types')

import schema from '../both/schemas/schema.js'
import { Files } from '../both/collection'

export const createFile = new ValidatedMethod({
  name: 'files.create',
  validate: schema.validator(),
  run(file) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    Files.write(file.content, {
      userId: Meteor.userId(),
      fileName: file.name,
      type: mime.lookup(file.name)
    }, (error, result) => {
      if (error) {
        if (Meteor.isClient) {
          sAlert.error(i18n.__('files.create.error'))
        }
        throw new Meteor.Error(500, 'Server error')
      }
      if (Meteor.isClient) {
        sAlert.success(i18n.__('files.create.ok'))
      }
    }, true)
  }
})

export const updateFile = new ValidatedMethod({
  name: 'files.update',
  validate: schema.validator(),
  run(file) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    
    // Check if the user can update the flow
    if (file.userId !== Meteor.userId()) {
      throw new Meteor.Error('no-access')
    }

    //return Files.remove(file._id)
  }
})

export const deleteFile = new ValidatedMethod({
  name: 'files.delete',
  validate: new SimpleSchema({ _id: { type: String } }).validator(),
  run(file) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    
    // Check if the user can delete the flow
    if (file.userId !== Meteor.userId()) {
      throw new Meteor.Error('no-access')
    }

    return Files.remove(file._id)
  }
})