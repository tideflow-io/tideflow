import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'cron',
  humanName: 's-cron.name',
  pluralName: 's-cron.pluralName',
  description: 's-cron.description',
  icon: 'far fa-calendar-alt',
  ownable: false,
  templates: {
    triggerHelp: 'triggerCronHelp',
    triggerHelpIntro: 'triggerCronHelpIntro',
  },
  hooks: {
    // service: {},
    // trigger: {}
  },
  events: [
    {
      name: 'called',
      humanName: 's-cron.events.called.name',
      viewerTitle: 's-cron.events.called.title',
      inputable: true,
      stepable: false,
      templates: {
        triggerEditor: 'triggerEditorCronEventCalled'
      },
      callback: () => {}
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)