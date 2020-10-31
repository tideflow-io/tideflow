import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'webform',
  humanName: 's-webform.name',
  pluralName: 's-webform.pluralName',
  description: 's-webform.description',
  icon: 'fas fa-clipboard-list',
  iconColor: '#FF3031',
  ownable: true,
  templates: {
    triggerHelp: 'triggerWebformHelp',
    triggerHelpIntro: 'triggerWebformHelpIntro',
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
    // trigger: {}
  },
  events: [
    {
      name: 'submitted',
      humanName: 's-webform.events.submitted.name',
      viewerTitle: 's-webform.events.submitted.viewer.title',
      inputable: true,
      stepable: false,
      callback: () => {}
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)