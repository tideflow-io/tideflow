const jwt = require('jsonwebtoken')

import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'

import { Flows } from '/imports/modules/flows/both/collection'
import { ExecutionsLogs } from '/imports/modules/executionslogs/both/collection'

import { triggerFlows } from '/imports/queue/server'

const jwtSecret = require('/imports/files/server/secret')

Router.route('/files', function () {
  const req = this.request
  const res = this.response

  const { type, token } = req.query

  if (!type || !token) {
    res.writeHead(404)
    res.end()
    return
  }

  let tokenData = {}

  try {
    tokenData = jwt.verify(token, jwtSecret).data
  } catch (ex) {
    res.writeHead(419)
    res.end()
    return
  }

  if (type === 'actionFile') {
    // token: 
    // {
    //   "_id": "xc2fR9qtwvkZFSp3Q",
    //   "execution": "5eyKi9Pjw5tkQizAH",
    //   "flow": "ZaBBLqoWJZ9Tzo8C7",
    //   "step": "o78QJesYWaCMqTr43",
    //   "user": "fc74opoSJuFYSQNSb",
    //   "fileName": "text.pdf"
    // }
    const { _id, execution, flow, step, user } = tokenData
    const executionLog = ExecutionsLogs.findOne({ _id, execution, flow, step, user })
    
    if (!executionLog) {
      res.writeHead(404)
      res.end()
      return
    }

    const { fileName, data } = executionLog.stepResult.data
    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`)
    res.end(new Buffer(data))
    return
  }

  res.writeHead(404)
  res.end()
}, {where: 'server'})