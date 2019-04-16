const Handlebars = require('handlebars')
import { moment } from 'meteor/momentjs:moment'

import { servicesAvailable } from '/imports/services/_root/server'

import { step, stepData } from '/imports/queue/server'

const puppeteer = require('puppeteer')

const generatePdf = async (template, data, cb) => {
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

  const content = Assets.getText(`pdfs/${template}.html`)
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
      name: 'build-pdf',
      visibe: true,
      callback: (service, flow, user, currentStep, executionLogs, executionId, logId, cb) => {
        const filesData = stepData(executionLogs, 'previous').filter(data => data.type === 'object')

        const pdfType = (currentStep.config || {}).type || null

        let results = []

        filesData.map(fileData => {
          let total = 0

          fileData.data.date = moment().format('LL')
          
          if (pdfType === 'bill') {
            (fileData.data.items || []).map(i => {
              total += Number(i.price || 0)
            })
            fileData.data.total = fileData.data.total || total
          }

          results.push({
            type: 'file',
            data: {
              fileName: `${pdfType}.pdf`,
              data: Meteor.wrapAsync(cb => generatePdf(pdfType, fileData.data, cb))()
            }
          })
        })

        cb(null, {
          result: results,
          next: true,
          msgs: [
            {
              m: 's-pdf.log.build_pdf_files_created',
              p: [filesData.length],
              d: new Date()
            }
          ]
        })
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)