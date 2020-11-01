import { Meteor } from 'meteor/meteor'
import { MongoInternals } from 'meteor/mongo'
const mime = require('mime-types')
import SimpleSchema from 'simpl-schema'
const Readable = require('stream').Readable

import lib from './lib'

import { FilesTemplates } from '/imports/modules/filesTemplates/both/collection'

import { pick } from '/imports/helpers/both/objects'

import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { isMember } from '../../_common/both/teams'

import schema from '../both/schemas/schema.js'
import { Files } from '../both/collection'

import { gfs } from './gfs'

export const createFile = new ValidatedMethod({
  name: 'files.create',
  validate: schema.validator(),
  async run(file) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    if (!isMember(Meteor.userId(), file.team)) throw new Meteor.Error('no-access')
    const newFile = await lib.create({
      user: Meteor.userId(),
      team: file.team,
      name: file.name,
      userCreated: true
    }, file.content)
    return pick(newFile, ['_id', 'team'])
  }
})

Meteor.methods({
  'files.getTemplate': (_id) => {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    return FilesTemplates.findOne({_id})
  },
  'files.updatePublic': (_id, isPublic) => {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    let originalFile = Files.findOne({_id})
    if (!isMember(Meteor.userId(), originalFile.team)) throw new Meteor.Error('no-access')
    Files.update(
      { _id: originalFile._id },
      { $set: { public: isPublic } }
    )
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

    if (!isMember(originalFile.user, originalFile.team)) throw new Meteor.Error('no-access')

    const { content } = file
    let update = {}

    // Update via gfs
    
    let uploadStream = gfs.openUploadStream(`${originalFile.user}/${new Date().getTime()}/${file.name}`)

    const buff = Buffer.from(content || '')

    update.$push = {
      versions: {
        date: new Date(),
        size: Buffer.byteLength(buff),
        gfsId: uploadStream.id.toString()
      }
    }

    update.$set = {
      name: file.name,
      size: Buffer.byteLength(buff),
      type: mime.lookup(file.name) || 'text/plain',
      ext: lib.getFilenameExtension(file.name) || ''
    }

    // Create stream with buffer to pipe to uploadStream
    var s = new Readable()
    s.push(buff)
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

    return { _id: file._id, team: file.team }
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

    if (!isMember(originalFile.user, originalFile.team)) throw new Meteor.Error('no-access')

    (originalFile.versions || []).map(v => {
      gfs.delete(
        MongoInternals.NpmModule.ObjectID(v.gfsId)
      )
    })

    Files.remove(originalFile._id)

    return true
  }
})
