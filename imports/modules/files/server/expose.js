import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'
import { Accounts } from 'meteor/accounts-base'

import lib from './lib'

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

  try {
    const fileVersion = lib.getOneVersion({ _id, user: authenticatedUser._id }, v)
    let downloadStream = lib.downloadStream(fileVersion.gfsId)
    downloadStream.on('error', err => { throw err })
    downloadStream.pipe(res)
  }
  catch (ex) {
    res.writeHead(404)
    res.end()
    return
  }
}, {where: 'server'})