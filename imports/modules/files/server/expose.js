import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'
import { Accounts } from 'meteor/accounts-base'

import { FilesTemplates } from '/imports/modules/filesTemplates/both/collection'

import lib from './lib'

const downloadFile = (_id, authenticatedUser, v, res) => {
  const fileVersion = lib.getOneVersion({ _id, user: authenticatedUser._id }, v)
  let downloadStream = lib.downloadStream(fileVersion.gfsId)
  downloadStream.on('error', err => { throw err })
  downloadStream.pipe(res)
}

const downloadTemplate = (_id, authenticatedUser, res) => {
  let f = FilesTemplates.findOne({_id})
  res.end(f.content)
}

Router.route('/file', function () {
  const req = this.request
  const res = this.response

  // Validate query parameters

  const { type, _id, v } = req.query

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
    if (type === 'fileTemplate') return downloadTemplate(_id, authenticatedUser, res)
    downloadFile(_id, authenticatedUser, v, res)
  }
  catch (ex) {
    res.writeHead(404)
    res.end()
    return
  }
}, {where: 'server'})
