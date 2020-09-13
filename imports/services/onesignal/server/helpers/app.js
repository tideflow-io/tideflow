import { Services } from '/imports/modules/services/both/collection'

module.exports.getOnesignalService = currentStep => {
  if (!currentStep.config || !currentStep.config.application) {
    throw new Error('application-not-available')
  }

  const applicationService = Services.findOne({
    _id: currentStep.config.application
  })

  if (!applicationService) {
    throw new Error('application-not-found')
  }
  const { appId, restApiKey } = applicationService.config
  return { appId, restApiKey }
}