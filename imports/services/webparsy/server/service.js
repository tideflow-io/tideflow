import { servicesAvailable, getResultsTypes } from '/imports/services/_root/server'

import filesLib from '/imports/modules/files/server/lib'

const webparsy = require('webparsy')
const debug = require('debug')('tideflow:services:webparsy')

const service = {
  name: 'webparsy',
  inputable: false,
  stepable: true,
  ownable: true,
  templates: {
  },
  hooks: {
    // step: {},
    // trigger: {}
    service: {
      create: {
        pre: (service) => {
          return service
        }
      },
      delete: {
        pre: (service) => {
          return service
        }
      }
    }
  },
  events: [
    {
      name: 'scrape',
      capabilities: {
        runInOneGo: true
      },
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        debug('scrape called')
        let string = null

        try {
          string = await filesLib.getOneAsString({ _id: currentStep.config.ymlFile })
          debug('Scraping definition: loaded')
        }
        catch (ex) {
          debug('Scraping definition failed', ex)
          cb(null, {
            result: {},
            next: false,
            error: true,
            msgs: [
              {
                m: 's-agent.log.scrape.commandfile.error',
                err: true,
                d: new Date()
              }
            ]
          })
          return
        }
        
        let previousStepsData = getResultsTypes(executionLogs, 'data')
        let webparsyFlags = {}

        if (previousStepsData.length) {
          webparsyFlags = _.chain(previousStepsData).reduce((i, m)=> Object.assign(i,m)).value()
        }

        debug('Flags', webparsyFlags)

        try {
          let scrapingResult = await webparsy.init({string, webparsyFlags})
          debug('Scraping result', Object.keys(scrapingResult).join(', '))
          let files = []

          await Promise.all( Object.keys(scrapingResult).map(async k => {
            return new Promise((resolve, reject) => {
              if (Buffer.isBuffer(scrapingResult[k])) {
                filesLib.fileFromBuffer(scrapingResult[k], k)
                  .then(fileInfo => {
                    if (!fileInfo) return resolve()
                    files.push(fileInfo)
                    delete scrapingResult[k]
                    resolve()
                  })
                  .catch(ex => {
                    console.error(ex)
                    delete scrapingResult[k]
                    resolve()
                  })
              }
              else {
                resolve()
              }
            })
          }))

          cb(null, {
            result: {
              data: scrapingResult,
              files
            },
            next: true,
            error: false,
            msgs: [
              {
                m: 's-webparsy.log.scrape.yaml.title',
                err: false,
                d: new Date()
              }
            ]
          })
        }
        catch (ex) {
          console.error(ex)
          cb(null, {
            result: {},
            next: false,
            error: true,
            msgs: [
              {
                m: 's-webparsy.log.scrape.yaml.errorTitle',
                err: false,
                d: new Date()
              },
              {
                m: ex.toString(),
                err: false,
                d: new Date()
              }
            ]
          })
        }
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)