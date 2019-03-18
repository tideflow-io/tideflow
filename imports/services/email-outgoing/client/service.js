import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'email-outgoing',
  humanName: 's-email-outgoing.name',
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
      name: 'to-me',
      humanName: 's-email-outgoing.events.tome.name',
      viewerTitle: 's-email-outgoing.events.tome.viewer.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} },
      templates: {
        eventConfig: 'servicesEmailOutgoingToMeConfig'
      },
      conditions: [
        // {}
      ]
    },
    {
      name: 'to-others',
      humanName: 's-email-outgoing.events.toother.name',
      viewerTitle: 's-email-outgoing.events.toother.viewer.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} },
      templates: {
        eventConfig: 'servicesEmailOutgoingToOthersConfig'
      },
      conditions: [
        // {}
      ]
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)