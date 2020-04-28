import { IotData } from 'aws-sdk'

import { getAwsProfile } from './profile'

module.exports.instance = async (currentStep, execution) => {
  const profile = await getAwsProfile(currentStep, execution)
  return new IotData({
    endpoint: currentStep.config.endpoint,
    region: profile.region,
    accessKeyId: profile.accessKeyId,
    secretAccessKey: profile.accessSecretId
  })
}