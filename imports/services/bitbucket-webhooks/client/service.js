import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'bb-webhooks',
  humanName: 's-bb-webhooks.name',
  description: 's-bb-webhooks.description',
  website: 'https://tideflow.io/docs/services-bb-webhooks',
  icon: 'fab fa-bitbucket',
  iconColor: 'rgb(7, 71, 166)',
  inputable: true,
  stepable: false,
  ownable: true,
  templates: {
    detailsView: 'servicesBbWebhooksDetailsView',
    createFormPre: 'servicesBbWebhooksCreateFormPre',
    updateFormPre: 'servicesBbWebhooksUpdateFormPre'
  },
  hooks: {
    // service: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'called',
      humanName: 's-bb-webhooks.events.called.name',
      viewerTitle: 's-bb-webhooks.events.called.viewer.title',
      inputable: true,
      stepable: false,
      callback: () => {},
      conditions: [
        // {}
      ]
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)