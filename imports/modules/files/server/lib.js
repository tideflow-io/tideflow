const mime = require('mime-types')
import path from 'path'
const Readable = require('stream').Readable

import { MongoInternals } from 'meteor/mongo'
import { Files } from '/imports/modules/files/both/collection.js'

import { gfs } from './gfs'

const getFilenameExtension = filename => {
  var ext = path.extname(filename||'').split('.')
  return ext[ext.length - 1]
}
module.exports.getFilenameExtension = getFilenameExtension

const getOne = (query) => {
  if (!query) throw 'not-found'
  return Files.findOne(query)
}
module.exports.getOne = getOne

const getOneVersion = (query, versionIndex) => {
  let file = getOne(query)
  if (!file) throw 'not-found'
  const version = file.versions[versionIndex || file.versions.length - 1]
  if (!version) throw 'not-found'
  return version
}
module.exports.getOneVersion = getOneVersion

const downloadStream = (fileId) => {
  if (!fileId) throw 'not-found'
  return gfs.openDownloadStream(MongoInternals.NpmModule.ObjectID(fileId))
}
module.exports.downloadStream = downloadStream

const streamToString = (stream) => {
  const chunks = []
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}
module.exports.streamToString = streamToString

const getOneAsString = (query, versionIndex) => {
  const file = getOne(query)
  const version = file.versions[versionIndex || file.versions.length - 1]
  const stream = downloadStream(version.gfsId)
  return streamToString(stream)
}
module.exports.getOneAsString = getOneAsString

const create = async (doc, content) => {
  delete doc.content

  if (!doc.user) throw Meteor.Error('no-user')

  // Add aditional file details
  if (!doc.type) doc.type = mime.lookup(doc.name) || 'text/plain'
  if (!doc.ext) doc.ext = getFilenameExtension(doc.name) || ''

  let uploadStream = gfs.openUploadStream(`${doc.user}/${new Date().getTime()}/${doc.name}`)

  doc.versions = [{
    date: new Date(),
    gfsId: uploadStream.id.toString()
  }]

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
  Files.insert(doc)
  return doc
}
module.exports.create = create