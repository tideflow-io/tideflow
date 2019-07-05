import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'webform',
  humanName: 's-webform.name',
  description: 's-webform.description',
  website: 'https://tideflow.io/docs/services-webforms',
  icon: 'fas fa-clipboard-list',
  iconColor: '#FF3031',
  ownable: true,
  templates: {
    createForm: 'servicesWebformCreateForm',
    updateForm: 'servicesWebformUpdateForm',
    detailsView: 'servicesWebformDetailsView',
    createFormAfter: 'servicesWebformCreateFormAfter',
    updateFormAfter: 'servicesWebformUpdateFormAfter',
    createFormPre: 'servicesWebformCreateFormPre',
    updateFormPre: 'servicesWebformUpdateFormPre'
  },
  hooks: {
    // service: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'submitted',
      humanName: 's-webform.events.submitted.name',
      viewerTitle: 's-webform.events.submitted.viewer.title',
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