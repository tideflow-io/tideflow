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
      name: 'create-input-log-file',
      humanName: 's-file.events.create-input-log-file.title',
      viewerTitle: 's-file.events.create-input-log-file.viewer.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} },
      templates: {
        eventConfig: 'servicesfileCreateInputLogFileConfig'
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
    },

    // {
    //   name: 'store-previous-files',
    //   humanName: 's-file.events.store-previous-files.title',
    //   viewerTitle: 's-file.events.store-previous-files.viewer.title',
    //   inputable: false,
    //   stepable: true,
    //   callback: () => { return {} },
    //   templates: {
    //     // eventConfig: 'servicesfileReadfileConfig'
    //   }
    // }

    
  ]
}

module.exports.service = service

servicesAvailable.push(service)