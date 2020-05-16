import { Meteor } from 'meteor/meteor'
const mime = require('mime-types')
const FileType = require('file-type')
import path from 'path'
const Readable = require('stream').Readable

import { MongoInternals } from 'meteor/mongo'
import { Files } from '/imports/modules/files/both/collection'

import { gfs } from './gfs'

/**
 * Returns a file's info given its buffer and a suggested name
 * 
 * @param {Buffer} buffer 
 * @param {String} nameSuggestion 
 * @returns {Object} File's info with the following format
 * 
 * {
 *  mimetype: 'text/plain',
 *  size: 50,
 *  fieldName: 'myfile.txt',
 *  fileName: 'myfile.txt',
 *  data: buffer
 * }
 */
const fileFromBuffer = async (buffer, nameSuggestion) => {
  const defaultFileType = {
    ext: 'txt',
    mime: 'text/plain'
  }

  if (!nameSuggestion) nameSuggestion = 'file'

  try {
    let fileType = await FileType.fromBuffer(buffer)
    if (!fileType) fileType = defaultFileType

    let name = `${nameSuggestion}.${fileType.ext}`
    return {
      mimetype: fileType.mime,
      size: buffer.length,
      fieldName: name,
      fileName: name,
      data: buffer
    }
  }
  catch (ex) {
    return {
      mimetype: defaultFileType.mime,
      size: buffer.length,
      fieldName: `${nameSuggestion}.${defaultFileType.ext}`,
      fileName: `${nameSuggestion}.${defaultFileType.ext}`,
      data: buffer
    }
  }
}

module.exports.fileFromBuffer = fileFromBuffer

/**
 * Returns a file's extension as in its name
 * 
 * @param {String} filename 
 * @returns {String} File's name extension
 */
const getFilenameExtension = filename => {
  var ext = path.extname(filename||'').split('.')
  return ext[ext.length - 1]
}
module.exports.getFilenameExtension = getFilenameExtension

/**
 * Queries the files collection
 * 
 * @param {Object} query 
 * @returns {Object} Record from the database
 */
const getOne = (query) => {
  if (!query) throw 'not-found'
  return Files.findOne(query)
}
module.exports.getOne = getOne

/**
 * Given a file's query and a version's number, return its information
 * @param {Object} query 
 * @param {Number} versionIndex 
 * @returns {Object} File's info with the following format:
 * 
 * {
 *  _id: 'rgthrynhgf562',
 *  versio: {
 *   "date" : ISODate("2020-05-16T18:32:39.331+02:00"),
 *   "gfsId" : "5ec015a723996a5b007df587"
 *  },
 *  file: { record from database }
 * }
 */
const getOneVersion = (query, versionIndex) => {
  let file = getOne(query)
  if (!file) throw 'not-found'
  const version = file.versions[versionIndex || file.versions.length - 1]
  if (!version) throw 'not-found'
  return {
    _id: file._id,
    version,
    file
  }
}
module.exports.getOneVersion = getOneVersion

/**
 * Get a flle from GridFileSystem given its Mongo DB id. This is is located on
 * the file's "versions" property
 * 
 * @param {*} fileId 
 */
const downloadStream = (fileId) => {
  if (!fileId) throw 'not-found'
  return gfs.openDownloadStream(MongoInternals.NpmModule.ObjectID(fileId))
}
module.exports.downloadStream = downloadStream

/**
 * Given a file's stream (from GridFyleSystem) return its contents as string
 * 
 * @param {Buffer} stream 
 * @returns {String} The file's stream as an string
 */
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
  if (!file) throw 'not-found'
  const version = file.versions[versionIndex || file.versions.length - 1]
  const stream = downloadStream(version.gfsId)
  return streamToString(stream)
}
module.exports.getOneAsString = getOneAsString

const remove = async (_id) => {
  if (Array.isArray(_id)) 
    return _id.map(i => gfs.delete(MongoInternals.NpmModule.ObjectID(i)))
  return gfs.delete(MongoInternals.NpmModule.ObjectID(_id))
}

module.exports.remove = remove

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
  s.push(Buffer.from(content))
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