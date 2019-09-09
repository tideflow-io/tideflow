import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'rss',
  icon: 'fa fa-rss',
  iconColor: '#FFA200',
  humanName: 's-rss.name',
  description: 's-rss.description',
  website: 'https://docs.tideflow.io/docs/services-rss',
  ownable: false,
  trigger: true,
  templates: {
    detailsView: 'servicesRssDetailsView',
    createForm: 'servicesRssCreateForm',
    createFormPre: 'servicesRssCreateFormPre',
    updateForm: 'servicesRssUpdateForm',
    updateFormPre: 'servicesRssUpdateFormPre'
  },
  hooks: {
    // service: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'new-content',
      humanName: 's-rss.events.new-content.name',
      viewerTitle: 's-rss.events.new-content.viewer.title',
      inputable: true,
      stepable: false,
      templates: {
        triggerEditor: 'triggerEditorRssEventNewContent'
      },
      callback: () => {}
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)