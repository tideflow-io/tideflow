import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'control-if',
  description: 's-control-if.description',
  humanName: 's-control-if.name',
  ownable: false,
  stepable: true,
  control: true,
  icon: 'far fa-file-code',
  templates: {
  },
  hooks: {
    // service: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'simple',
      humanName: 'control-if simple',
      viewerTitle: 's-control-if.events.simple.title',
      inputable: false,
      stepable: true,
      templates: {
        eventConfig: 'servicesIfSimpleCommonConfig'
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)