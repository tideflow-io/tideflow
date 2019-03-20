import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'webparsy',
  humanName: 's-webparsy.name',
  description: 's-webparsy.description',
  website: 'https://docs.tideflow.io/docs/services-webparsy',
  icon: 'fas fa-save',
  iconColor: '#3498DB',
  ownable: false,
  templates: {
  },
  hooks: {
    // channel: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'scrape',
      humanName: 's-webparsy.events.scrape.name',
      viewerTitle: 's-webparsy.events.scrape.title',
      inputable: false,
      stepable: true,
      callback: () => {},
      templates: {
        eventConfig: 'servicesWebparsyScrapeConfig'
      },
      conditions: [
        // {}
      ]
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)