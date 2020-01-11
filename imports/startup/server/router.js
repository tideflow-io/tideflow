import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'

const Busboy = require('busboy')
Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({
  limit : '500mb'
}));

Router.onBeforeAction((req, res, next) => {
  res.setHeader('Access-Control-Allow-Method', '*');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, api-key')

  if (req.method === 'OPTIONS') {
    return res.end()
  }

  var filenames = []
  if (req.method === 'POST') {
    if (req.headers['content-type'].includes('application/json')) {
      next()
      return
    }
    var busboy = new Busboy({ headers: req.headers })
    busboy.on('file', (fieldName, file, fileName, encoding, mimetype) => {
      let buffers = []
      file.on('data', function(data) {
        buffers.push(data);
      });
      file.on('end', function() {
        var fileBuffer = Buffer.concat(buffers);
        filenames.push({
          fieldName, data: fileBuffer, fileName, encoding, mimetype, size: fileBuffer.length
        })
      })
    })
    busboy.on('field', (fieldname, value) => {
      if (!req.body) req.body = {}
      req.body[fieldname] = value
    })
    busboy.on('finish', () => {
      req.files = filenames
      next()
    })
    req.pipe(busboy)
  } else {
    next()
  }
})
