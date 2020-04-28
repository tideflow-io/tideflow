import { Services } from '/imports/modules/services/both/collection.js'

module.exports.getAwsProfile = (currentStep, execution) => {
  if (!currentStep.config || !currentStep.config.profile) {
    throw new Error('credentials-not-available')
  }

  const credentialService = Services.findOne({
    _id: currentStep.config.profile,
    team: execution.fullFlow.team
  })

  if (!credentialService) {
    throw new Error('credentials-not-available')
  }
  const { accessKeyId, accessSecretId, region } = credentialService.config
  return { accessKeyId, accessSecretId, region }
}