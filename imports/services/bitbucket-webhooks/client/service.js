import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'bb-webhooks',
  humanName: 's-bb-webhooks.name',
  description: 's-bb-webhooks.description',
  icon: 'fab fa-bitbucket',
  iconColor: 'rgb(7, 71, 166)',
  inputable: true,
  stepable: false,
  ownable: true,
  templates: {
    triggerHelp: 'triggerBBWebhooksHelp',
    triggerHelpIntro: 'triggerBBWebhooksHelpIntro',
    detailsView: 'servicesBbWebhooksDetailsView',
    createFormPre: 'servicesBbWebhooksCreateFormPre',
    updateFormPre: 'servicesBbWebhooksUpdateFormPre'
  },
  hooks: {
    // service: {},
    // trigger: {}
  },
  events: [
    {
      name: 'called',
      humanName: 's-bb-webhooks.events.called.name',
      viewerTitle: 's-bb-webhooks.events.called.viewer.title',
      inputable: true,
      stepable: false,
      callback: () => {}
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)