import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'webparsy',
  humanName: 's-webparsy.name',
  description: 's-webparsy.description',
  website: 'https://tideflow.io/docs/services-webparsy',
  icon: 'fa fa-spider',
  iconColor: '#627F89',
  ownable: false,
  inputable: false,
  stepable: true,
  templates: {
  },
  hooks: {
    // service: {},
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
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)