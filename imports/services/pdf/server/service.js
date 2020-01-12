const Handlebars = require('handlebars')

import filesLib from '/imports/modules/files/server/lib'

import { moment } from 'meteor/momentjs:moment'
import { servicesAvailable } from '/imports/services/_root/server'

const puppeteer = require('puppeteer')

const generatePdf = async (content, data, cb) => {
  let options = {
    width: 1280,
    height: 800,
    scaleFactor: 2,
    fullPage: false,
    defaultBackground: true,
    timeout: 60, // The Puppeteer default of 30 is too short
    delay: 0,
    debug: false,
    launchOptions: {},
    _keepAlive: false
  }

  const launchOptions = {...options.launchOptions}

  const html = Handlebars.compile(content)(data)
  const browser = await puppeteer.launch(launchOptions)
  const page = await browser.newPage()
  await page.setContent(html)
  const file = await page.pdf() 
  await browser.close()
  cb(null, file)
}

const service = {
  name: 'pdf',
  inputable: false,
  stepable: true,
  ownable: false,
  hooks: {
    // service: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'create-from-html',
      visibe: true,
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        const lastData = ([].concat(executionLogs).pop() || {}).stepResult
        const fileData = lastData.data || {}

        try {
          const file = await filesLib.getOne({ _id: currentStep.config.file })
          const string = await filesLib.getOneAsString({ _id: file._id })
          const fileBuffer = Meteor.wrapAsync(cb => generatePdf(string, fileData, cb))()
          cb(null, {
            result: {
              data: {},
              files: [
                {
                  mimetype: 'application/pdf',
                  size: fileBuffer.length,
                  fieldName: `${execution._id}.pdf`,
                  fileName: `${execution._id}.pdf`,
                  data: fileBuffer
                }
              ]
            },
            next: true,
            msgs: [
              {
                m: 's-pdf.log.create-from-html.created',
                p: [],
                d: new Date()
              }
            ]
          })
        }
        catch (ex) {
          cb(null, {
            result: {},
            next: true,
            error: true,
            msgs: [{
              m: 's-pdf.log.create-from-html.retrieveFailed',
              p: [],
              d: new Date(),
              e: true
            }]
          })
        }

      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)
