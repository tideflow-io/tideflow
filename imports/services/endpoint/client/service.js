import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'endpoint',
  humanName: 's-endpoint.name',
  description: 's-endpoint.description',
  website: 'https://www.tideflow.io/features/channels/endpoint/',
  icon: 'fa fa-server',
  iconColor: '#563D7C',
  inputable: true,
  stepable: false,
  ownable: true,
  templates: {
    detailsView: 'servicesEndpointDetailsView',
    createFormPre: 'servicesEndpointCreateFormPre',
    updateFormPre: 'servicesEndpointUpdateFormPre'
  },
  hooks: {
    // channel: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'called',
      humanName: 's-endpoint.events.called.name',
      viewerTitle: 's-endpoint.events.called.viewer.title',
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