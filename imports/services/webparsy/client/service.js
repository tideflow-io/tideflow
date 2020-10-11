import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'webparsy',
  humanName: 's-webparsy.name',
  description: 's-webparsy.description',
  icon: 'fab fa-chrome',
  iconColor: '#1E6DA5',
  ownable: false,
  inputable: false,
  stepable: true,
  templates: {
    helpIntro: 'servicesWebparsyHelpIntro'
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
