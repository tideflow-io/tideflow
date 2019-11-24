import { MongoInternals } from 'meteor/mongo'
import { Files } from '/imports/modules/files/both/collection.js'

import { gfs } from './gfs'

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