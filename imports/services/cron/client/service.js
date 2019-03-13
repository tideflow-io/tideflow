import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'cron',
  humanName: 's-cron.name',
  // description: 's-cron.description',
  inputable: true,
  stepable: false,
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
      name: 'called',
      humanName: 's-cron.events.called.name',
      viewerTitle: 's-cron.events.called.title',
      templates: {
        triggerEditor: 'triggerEditorCronEventCalled'
      },
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