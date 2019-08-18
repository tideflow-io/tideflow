import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'email-outgoing',
  humanName: 's-email-outgoing.name',
  description: 's-email-outgoing.description',
  icon: 'far fa-envelope',
  ownable: false,
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
      name: 'to-me',
      humanName: 's-email-outgoing.events.tome.name',
      viewerTitle: 's-email-outgoing.events.tome.viewer.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} },
      templates: {
        eventConfig: 'servicesEmailOutgoingToMeConfig'
      }
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
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)