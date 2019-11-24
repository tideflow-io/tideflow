const Handlebars = require('handlebars')
import { moment } from 'meteor/momentjs:moment'

import { servicesAvailable } from '/imports/services/_root/server'

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
      callback: (user, currentStep, executionLogs, execution, logId, cb) => {
        const lastData = _.last(executionLogs) ? _.last(executionLogs).stepResult : {}

        const fileData = lastData.type === 'object' ? lastData : { data: {} }

        const pdfType = (currentStep.config || {}).type || 'simple';

        let results = {};

        let total = 0

        fileData.data.date = moment().format('LL')
        
        if (pdfType === 'bill') {
          (fileData.data.items || []).map(i => {
            total += Number(i.price || 0)
          })
          fileData.data.total = fileData.data.total || total
        }

        cb(null, {
          result: {
            type: 'file',
            data: {
              fileName: `${pdfType}.pdf`,
              data: Meteor.wrapAsync(cb => generatePdf(pdfType, fileData.data, cb))()
            }
          },
          next: true,
          msgs: [
            {
              m: 's-pdf.log.build_pdf.files_created',
              p: [],
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