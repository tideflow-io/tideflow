const jwt = require('jsonwebtoken')

import { Router } from 'meteor/iron:router'

import { ExecutionsLogs } from '/imports/modules/executionslogs/both/collection'

const jwtSecret = require('/imports/download/server/secret')

Router.route('/download', function () {
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
    // tokenData: 
    // {
    //   "_id": "xc2fR9qtwvkZFSp3Q",
    //   "execution": "5eyKi9Pjw5tkQizAH",
    //   "flow": "ZaBBLqoWJZ9Tzo8C7",
    //   "step": "o78QJesYWaCMqTr43",
    //   "user": "fc74opoSJuFYSQNSb",
    //   "fileName": "text.pdf",
    //   "fieldName": "myfile"
    // }
    const { _id, execution, flow, step, user, fieldName } = tokenData
    const executionLog = ExecutionsLogs.findOne({ _id, execution, flow, step, user })

    if (!executionLog) {
      res.writeHead(404)
      res.end()
      return
    }

    const { fileName, data } = executionLog.result.files.find(f => f.fieldName === fieldName)

    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`)
    res.end(Buffer.from(data))
    return
  }

  res.writeHead(404)
  res.end()
}, {where: 'server'})
