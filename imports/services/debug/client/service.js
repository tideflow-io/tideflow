import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'debug',
  humanName: 's-debug.name',
  ownable: false,
  templates: {
  },
  hooks: {
    // service: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'e1',
      humanName: 'debug',
      viewerTitle: 's-debug.events.e1.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} },
      conditions: [
        // {}
      ]
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)