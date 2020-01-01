import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'

const os = require('os')
const path = require('path')
const fs = require('fs')
const Busboy = require('busboy')

if (Meteor.isServer) {

  Router.onBeforeAction((req, res, next) => {
    var filenames = []
    
    if (req.method === 'POST') {
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
}
