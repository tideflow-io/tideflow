import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'file',
  description: 's-file.description',
  humanName: 's-file.name',
  icon: 'far fa-file',
  iconColor: '#008FEF',
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
    },

    {
      name: 'read-file',
      humanName: 's-file.events.readFile.title',
      viewerTitle: 's-file.events.readFile.viewer.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} },
      templates: {
        eventConfig: 'servicesfileReadfileConfig'
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)