const Handlebars = require('handlebars')

import filesLib from '/imports/modules/files/server/lib'

import { servicesAvailable } from '/imports/services/_root/server'

const webparsy = require('webparsy')

const generatePdf = async (content, data, cb) => {
  let options = {
    width: 1280,
    height: 800,
    scaleFactor: 2,
    fullPage: false,
    defaultBackground: true,
    timeout: 600,
    delay: 0,
    debug: false
  }

  const html = Handlebars.compile(content)(data)
  const browser = await webparsy.init({
    json: {
      version: 1,
      jobs: {
        main: {
          browser: options,
          steps: [
            {
              setContent: {
                flag: 'html'
              }
            },
            {
              pdf: {
                as: 'file',
                format: 'A4'
              }
            }
          ]
        }
      }
    },
    flags: {
      html
    }
  })
  cb(null, browser.file)
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
      capabilities: {
        runInOneGo: true
      },
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        const lastData = ([].concat(executionLogs).pop() || {}).stepResult
        const fileData = lastData ? lastData.data || {} : {}

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
                p: { fileName: `${execution._id}.pdf` },
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
              d: new Date(),
              e: true
            },
            {
              m: ex.message,
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
