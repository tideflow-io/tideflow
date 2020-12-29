import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'conditions',
  description: 's-conditions.description',
  humanName: 's-conditions.name',
  ownable: false,
  stepable: true,
  icon: 'fas fa-question',
  templates: {
    outputs: 'servicesConditionOutputs',
    helpIntro: 'servicesConditionsHelpIntro'
  },
  hooks: {
    // service: {},
    // trigger: {}
  },
  events: [
    {
      name: 'if',
      humanName: 'if',
      viewerTitle: 's-conditions.events.e1.title',
      inputable: false,
      stepable: true,
      templates: {
        eventConfig: 'servicesConditionIfConfig'
      },
      callback: () => { return {} }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)