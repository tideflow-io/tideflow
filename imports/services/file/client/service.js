import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'file',
  description: 's-file.description',
  humanName: 's-file.name',
  icon: 'far fa-file-file',
  iconColor: '#ff0000',
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
      name: 'create-file',
      humanName: 's-file.events.createfile.title',
      viewerTitle: 's-file.events.createfile.viewer.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} },
      templates: {
        eventConfig: 'servicesfileCreatefileConfig'
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)