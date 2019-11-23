import { Random } from 'meteor/random'
import { Meteor } from 'meteor/meteor'
import { MongoInternals } from 'meteor/mongo'
import path from 'path'
const mime = require('mime-types')
import SimpleSchema from 'simpl-schema'
const Readable = require('stream').Readable

import { pick } from '/imports/helpers/both/objects'

import { ValidatedMethod } from 'meteor/mdg:validated-method'

import schema from '../both/schemas/schema.js'
import { Files } from '../both/collection'

import { gfs } from './gfs'

const getExtension = filename => {
  var ext = path.extname(filename||'').split('.')
  return ext[ext.length - 1]
}

export const createFile = new ValidatedMethod({
  name: 'files.create',
  validate: schema.validator(),
  async run(file) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')

    // Some hooks may need to have a pre-defined _id
    file._id = Random.id()

    // Ensure the file's owner is the logged-in user
    file.user = Meteor.userId()


    // Add aditional file details
    file.type = mime.lookup(file.name) || 'application/octet-stream'
    file.ext = getExtension(file.name) || 'bin'

    let uploadStream = gfs.openUploadStream(`${file.user}/${new Date().getTime()}/${file.name}`)

    file.versions = [{
      date: new Date(),
      gfsId: uploadStream.id.toString()
    }]

    // Create stream with buffer to pipe to uploadStream
    var s = new Readable()
    s.push(file.content)
    s.push(null) // Push null to end stream
    s.pipe(uploadStream)
    
    await new Promise((resolve, reject) => {
      uploadStream.once('finish', () => {
        resolve()
      })
    })
    Files.insert(file)
    return pick(file, ['_id'])
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
      type: mime.lookup(file.name) || 'application/octet-stream',
      ext: getExtension(file.name) || 'bin'
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