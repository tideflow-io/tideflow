import filesLib from '/imports/modules/files/server/lib'
import { servicesAvailable, getResultsTypes } from '/imports/services/_root/server'
const slugify = require('slugify')

const service = {
  name: 'file',
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
      name: 'create-input-log-file',
      visibe: true,
      callback: (user, currentStep, executionLogs, execution, logId, cb) => {
        let previousSteps = executionLogs.map(el => el.stepResult)
        
        previousSteps.map(previousStep => {
          if (previousStep.files) previousStep.files.map(f => f.data = '...')
        })

        const fileName = slugify(`${execution.fullFlow.title} ${execution._id.substring(0, 3)}`).toLowerCase()

        filesLib.create({
          user: user._id,
          name: `${fileName}.json`
        }, JSON.stringify(previousSteps, ' ', 2))

        cb(null, {
          result: {
            files: [
              {
                fileName: `${fileName}.json`,
                data: Buffer.from(JSON.stringify(previousSteps, ' ', 2), 'utf-8')
              }
            ]
          },
          next: true,
          error: false,
          msgs: [{
            m: 's-file.log.create-input-log-file.created',
            p: [],
            d: new Date()
          }]
        })
      }
    },

    {
      name: 'read-file',
      visibe: true,
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        try {
          const file = await filesLib.getOne({
            _id: currentStep.config.file
          })
          const string = await filesLib.getOneAsString({
            _id: file._id
          })

          cb(null, {
            result: {
              files: [
                {
                  fileName: file.name,
                  data: Buffer.from(string, 'utf-8')
                }
              ]
            },
            next: true,
            error: false,
            msgs: [{
              m: 's-file.log.read-file.readed',
              p: [],
              d: new Date()
            }]
          })
        } catch (ex) {
          cb(null, {
            result: {},
            next: true,
            error: true,
            msgs: [{
              m: 's-file.log.read-file.retrieveFailed',
              p: [],
              d: new Date(),
              e: true
            }]
          })
        }


      }
    },

    {
      name: 'store-previous-files',
      visibe: true,
      callback: (user, currentStep, executionLogs, execution, logId, cb) => {
        let previousFiles = getResultsTypes(executionLogs, 'files')
        
        let fileNames = []

        previousFiles.map(file => {
          const fileName = slugify(`${execution._id.substring(0, 3)}-${file.fileName}`).toLowerCase()
          //require('fs').writeFileSync(`/Users/joseconstela/Desktop/${fileName}`, file.data.data)
          fileNames.push(fileName)
          return filesLib.create({
            user: user._id,
            name: fileName
          }, file.data)
        })

        cb(null, {
          result: {
            data: {
              fileNames
            }
          },
          next: true,
          error: false,
          msgs: [{
            m: 's-file.log.store-previous-files.created',
            p: [fileNames.length],
            d: new Date()
          }]
        })
      }
    },
  ]
}

module.exports.service = service

servicesAvailable.push(service)
