import { Meteor } from 'meteor/meteor'
import { MongoInternals } from 'meteor/mongo'
const mime = require('mime-types')
import SimpleSchema from 'simpl-schema'
const Readable = require('stream').Readable

import lib from './lib'

import { pick } from '/imports/helpers/both/objects'

import { ValidatedMethod } from 'meteor/mdg:validated-method'

import schema from '../both/schemas/schema.js'
import { Files } from '../both/collection'

import { gfs } from './gfs'

export const createFile = new ValidatedMethod({
  name: 'files.create',
  validate: schema.validator(),
  async run(file) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    const newFile = await lib.create({
      user: Meteor.userId(),
      name: file.name,
      userCreated: true
    }, file.content)
    return pick(newFile, ['_id'])
  }
})

export const updateFile = new ValidatedMethod({
  name: 'files.update',
  validate: schema.validator(),
  async run(file) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    let originalFile = Files.findOne({_id: file._id})

    if (!originalFile) {
      throw new Meteor.Error('not-found')
    }

    // Check if the user can update the file
    if (originalFile.user !== Meteor.userId()) {
      throw new Meteor.Error('no-access')
    }

    const { content } = file
    let update = {}

    // Update via gfs
    
    let uploadStream = gfs.openUploadStream(`${originalFile.user}/${new Date().getTime()}/${file.name}`)

    update.$push = {
      versions: {
        date: new Date(),
        gfsId: uploadStream.id.toString()
      }
    }

    update.$set = {
      name: file.name,
      type: mime.lookup(file.name) || 'text/plain',
      ext: lib.getFilenameExtension(file.name) || ''
    }

    // Create stream with buffer to pipe to uploadStream
    var s = new Readable()
    s.push(content)
    s.push(null) // Push null to end stream
    s.pipe(uploadStream)
    
    await new Promise((resolve, reject) => {
      uploadStream.once('finish', () => {
        resolve()
      })
    })
    
    Files.update(
      { _id: file._id },
      update
    )

    return { _id: file._id }
  }
})

export const deleteFile = new ValidatedMethod({
  name: 'files.delete',
  validate: new SimpleSchema({ _id: { type: String } }).validator(),
  run(file) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    
    let originalFile = Files.findOne({_id: file._id})

    if (!originalFile) {
      throw new Meteor.Error('not-found')
    }

    // Check if the user can delete the file
    if (originalFile.user !== Meteor.userId()) {
      throw new Meteor.Error('no-access')
    }

    (originalFile.versions || []).map(v => {
      gfs.delete(
        MongoInternals.NpmModule.ObjectID(v.gfsId)
      )
    })

    Files.remove(originalFile._id)

    return true
  }
})
