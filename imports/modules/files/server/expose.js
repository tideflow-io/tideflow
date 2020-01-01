const jwt = require('jsonwebtoken')

import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'
import { Accounts } from 'meteor/accounts-base'

const jwtSecret = require('/imports/download/server/secret')
import lib from './lib'

const downloadFile = (_id, authenticatedUser, v, force, req, res) => {
  const fileData = lib.getOneVersion({ _id, user: authenticatedUser.user._id }, v)

  if (!fileData) {
    res.writeHead(404)
    res.end()
    return
  }
  
  if (force) {
    let downloadStream = lib.downloadStream(fileData.version.gfsId)
    downloadStream.on('error', err => { throw err })
    res.setHeader('Content-Disposition', `attachment;filename=${fileData.file.name}`);
    res.setHeader('Content-Type', fileData.file.type)
    downloadStream.pipe(res)
  }
  else {
    let token = jwt.sign({
      exp: Math.floor(Date.now() / 1000) + 5,
      data: {
        t: authenticatedUser.token,
        u: authenticatedUser.user._id,
        _id,
        v
      }
    }, jwtSecret)

    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({
      url: `${req.url}&force=true&token=${token}`
    }))
  }
}

Router.route('/file', function () {
  const req = this.request
  const res = this.response
  let { u, t } = req.headers
  let { _id, v, force, token } = req.query

  // Validate query parameters
  if (!_id) {
    res.writeHead(404)
    res.end()
    return
  }

  if (token) {
    let tokenData = {}
    try {
      tokenData = jwt.verify(token, jwtSecret).data
      t = tokenData.t
      u = tokenData.u
      _id = tokenData._id
    } catch (ex) {
      res.writeHead(419)
      res.end()
      return
    }
  }

  // Validate and retrieve user
  const authenticatedUser = Meteor.users.findOne(
    { _id: u, 'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(t)}
  )
  
  if (!authenticatedUser) {
    res.writeHead(409)
    res.end()
    return
  }

  try {
    // if (type === 'fileTemplate') return downloadTemplate(_id, authenticatedUser, res)
    downloadFile(_id, {
      user: authenticatedUser,
      token: t
    }, v, force, req, res)
  }
  catch (ex) {
    console.error(ex)
    res.writeHead(404)
    res.end()
    return
  }
}, {where: 'server'})
