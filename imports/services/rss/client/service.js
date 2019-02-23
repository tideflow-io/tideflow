import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'rss',
  icon: 'fa fa-rss',
  iconColor: '#FFA200',
  humanName: 's-rss.name',
  description: 's-rss.description',
  website: 'https://www.tideflow.io/features/channels/rss/',
  inputable: true,
  stepable: false,
  ownable: true,
  templates: {
    detailsView: 'servicesRssDetailsView',
    createForm: 'servicesRssCreateForm',
    createFormPre: 'servicesRssCreateFormPre',
    updateForm: 'servicesRssUpdateForm',
    updateFormPre: 'servicesRssUpdateFormPre'
  },
  hooks: {
    // channel: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'new-content',
      humanName: 's-rss.events.new-content.name',
      viewerTitle: 's-rss.events.new-content.viewer.title',
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