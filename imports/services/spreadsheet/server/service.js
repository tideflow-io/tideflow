import { Services } from '/imports/modules/services/both/collection'
import { servicesAvailable, getResultsTypes } from '/imports/services/_root/server'
import { getSocketByAgentId, ioToPrivate } from '../../agent/server/socket'

const service = {
  name: 'spreadsheets',
  humanName: 's-spreadsheets.name',
  inputable: false,
  stepable: true,
  ownable: true,
  templates: {},
  hooks: {},
  events: [
    {
      name: 'pushRow',
      capabilities: {
        runInOneGo: true
      },
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        const { fullFlow } = execution

        const agent = currentStep.config.agent
        
        const socket = getSocketByAgentId(agent)

        try {
          await ioToPrivate(socket, 'tf.spreadsheets.pushRow', {
            flow: fullFlow._id,
            execution: execution._id,
            log: logId,
            step: currentStep._id,
            filePath: currentStep.config.filePath,
            data: getResultsTypes(executionLogs, 'data') || []
          })

          cb(null, {
            result: {},
            next: true,
            error: false,
            msgs: [
              {
                m: 's-spreadsheets.log.pushRow.sent.success',
                err: false,
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
            msgs: [
              {
                m: 's-spreadsheets.log.pushRow.sent.error',
                err: true,
                p: [],
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
