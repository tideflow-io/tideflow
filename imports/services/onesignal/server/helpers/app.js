import { Services } from '/imports/modules/services/both/collection'

module.exports.getOnesignalService = currentStep => {
  if (!currentStep.config || !currentStep.config._id) {
    throw new Error('application-not-available')
  }

  const applicationService = Services.findOne({
    _id: currentStep.config._id
  })

  if (!applicationService) {
    throw new Error('application-not-found')
  }
  const { appId, restApiKey } = applicationService.config
  return { appId, restApiKey }
}