import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'
import { Accounts } from 'meteor/accounts-base'
import { MongoInternals } from 'meteor/mongo'

import { Files } from '/imports/modules/files/both/collection.js'

import { gfs } from './gfs'

Router.route('/file', function () {
  const req = this.request
  const res = this.response

  // Validate query parameters

  const { _id, v } = req.query

  if (!_id) {
    res.writeHead(404)
    res.end()
    return
  }

  // Validate and retrieve user

  const { u, t } = req.headers
  
  const authenticatedUser = Meteor.users.findOne(
    { _id: u, 'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(t)}
  )
  
  if (!authenticatedUser) {
    res.writeHead(409)
    res.end()
    return
  }

  // Retrieve file document

  const file = Files.findOne({
    _id, user: authenticatedUser._id
  })

  if (!file) {
    res.writeHead(404)
    res.end()
    return
  }

  const version = file.versions[v || file.versions.length - 1]

  if (!version) {
    res.writeHead(404)
    res.end()
    return
  }

  // Pipe gfs file to response

  let downloadStream = gfs.openDownloadStream(MongoInternals.NpmModule.ObjectID(version.gfsId))
  downloadStream.on('error', err => { throw err })
  downloadStream.pipe(res)
}, {where: 'server'})