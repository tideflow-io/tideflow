import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'gh-webhooks',
  humanName: 's-gh-webhooks.name',
  description: 's-gh-webhooks.description',
  website: 'https://docs.tideflow.io/docs/services-gh-webhooks',
  icon: 'fab fa-github',
  iconColor: '#CCC',
  inputable: true,
  stepable: false,
  ownable: true,
  templates: {
    detailsView: 'servicesGhWebhooksDetailsView',
    createFormPre: 'servicesGhWebhooksCreateFormPre',
    updateFormPre: 'servicesGhWebhooksUpdateFormPre'
  },
  hooks: {
    // channel: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'called',
      humanName: 's-gh-webhooks.events.called.name',
      viewerTitle: 's-gh-webhooks.events.called.viewer.title',
      visibe: true,
      callback: () => {},
      conditions: [
        // {}
      ]
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)