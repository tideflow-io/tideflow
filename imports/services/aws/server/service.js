import { servicesAvailable, buildTemplate } from '/imports/services/_root/server'

import { instance as iotData } from './helpers/iotData'
import { getAwsProfile } from './helpers/profile'
import { Lambda } from 'aws-sdk'

const awsResponse = (err, data, success, cb) => {
  const lines = err ? [{
    m: err.message,
    err: true,
    d: new Date()
  }] : [{
    m: success,
    d: new Date()
  }]
  
  cb(null, {
    result: data ? { data } : {},
    error: !!err,
    next: true,
    msgs: lines
  })
}

const service = {
  name: 'aws',
  humanName: 's-aws.name',
  inputable: false,
  stepable: true,
  ownable: true,
  templates: {},
  events: [
    {
      name: 'iot-shadow-get',
      capabilities: {
        runInOneGo: true
      },
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        try {
          currentStep.config.endpoint = buildTemplate(execution, executionLogs, currentStep.config.endpoint)
          currentStep.config.thingName = buildTemplate(execution, executionLogs, currentStep.config.thingName)
          
          let client = await iotData(currentStep, execution)
  
          client.getThingShadow({
            thingName: currentStep.config.thingName
          }, (err, data) => {
            awsResponse(err, data ? JSON.parse(data.payload) : null, 's-aws.log.iot-shadow-get.ok', cb)
          })
        }
        catch (ex) {
          cb(null, {
            result: {},
            next: true,
            error: true,
            msgs: [{
              m: 's-aws.log.iot-shadow-get.error',
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
    },
    {
      name: 'iot-shadow-update',
      capabilities: {
        runInOneGo: true
      },
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        try {
          currentStep.config.thingName = buildTemplate(execution, executionLogs, currentStep.config.thingName)
          currentStep.config.endpoint = buildTemplate(execution, executionLogs, currentStep.config.endpoint)
          let shadowData = buildTemplate(execution, executionLogs, currentStep.config.shadow)
          shadowData = JSON.parse(shadowData)
  
          let client = await iotData(currentStep, execution)
          client.updateThingShadow({
            thingName: currentStep.config.thingName,
            payload: Buffer.from(JSON.stringify(shadowData))
          }, (err, data) => {
            awsResponse(err, JSON.parse(data.payload), 's-aws.log.iot-shadow-update.ok', cb)
          })
        }
        catch (ex) {
          cb(null, {
            result: {},
            next: true,
            error: true,
            msgs: [{
              m: 's-aws.log.iot-shadow-update.error',
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
    },
    {
      name: 'lambda-invoke',
      capabilities: {
        runInOneGo: true
      },
      callback: async (user, currentStep, executionLogs, execution, logId, cb) => {
        currentStep.config.functionName = buildTemplate(execution, executionLogs, currentStep.config.functionName)
        let data = buildTemplate(execution, executionLogs, currentStep.config.data, {
          external: true
        })
        let invokeData = null

        try { 
          invokeData = JSON.parse(data)
          invokeData = JSON.stringify(invokeData)
        } catch (ex) {
          invokeData = data
        }

        var params = {
          FunctionName: currentStep.config.functionName, /* required */
          InvocationType: 'Event', // | RequestResponse | DryRun,
          Payload: invokeData
        }
        const profile = await getAwsProfile(currentStep, execution)
        new Lambda({
          region: profile.region,
          accessKeyId: profile.accessKeyId,
          secretAccessKey: profile.accessSecretId
        }).invoke(params, (err, data) => {
          awsResponse(err, data, 's-aws.log.lambda-invoke.ok', cb)
        });
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)
