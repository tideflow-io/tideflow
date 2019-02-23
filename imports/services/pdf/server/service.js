import { servicesAvailable } from '/imports/services/_root/server'

import { step, stepData } from '/imports/queue/server'

const pdfTypes = require('./pdfs')

const fs = require('fs')

const debug = console.log

const service = {
  name: 'pdf',
  inputable: false,
  stepable: true,
  ownable: false,
  hooks: {
    // channel: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'build-pdf',
      visibe: true,
      callback: (channel, flow, user, currentStep, executionLogs, executionId, logId) => {
        debug('pdf.build-pdf.callback')
        const filesData = stepData(executionLogs, 'last').filter(data => data.type === 'object')

        const pdfType = (currentStep.config || {}).type || null
        if (!pdfType || !pdfTypes[pdfType]) return null
        
        const result = []

        debug(`Building ${filesData.length} files`)

        filesData.map(fileData => {
          result.push({
            type: 'file',
            data: {
              fileName: `${pdfType}.pdf`,
              data: pdfTypes[pdfType].build(channel, user, currentStep, fileData.data)
            }
          })
        })

        return {
          result,
          next: true,
          msgs: [
            {
              m: 's-pdf.log.build_pdf_files_created',
              p: [filesData.length],
              d: new Date()
            }
          ]
        }
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)