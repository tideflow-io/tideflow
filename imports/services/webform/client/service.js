import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'webform',
  humanName: 's-webform.name',
  description: 's-webform.description',
  website: 'https://docs.tideflow.io/docs/services-webforms',
  icon: 'fa fa-server',
  iconColor: '#563D7C',
  inputable: true,
  stepable: false,
  ownable: true,
  templates: {
    detailsView: 'servicesWebformDetailsView',
    createFormAfter: 'servicesWebformCreateFormAfter',
    updateFormAfter: 'servicesWebformUpdateFormAfter',
    createFormPre: 'servicesWebformCreateFormPre',
    updateFormPre: 'servicesWebformUpdateFormPre'
  },
  hooks: {
    // channel: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'submitted',
      humanName: 's-webform.events.submitted.name',
      viewerTitle: 's-webform.events.submitted.viewer.title',
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