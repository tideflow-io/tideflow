import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'spreadsheets',
  humanName: 's-spreadsheets.name',
  description: 's-spreadsheets.description',
  website: 'https://docs.tideflow.io/docs/services-spreadsheets',
  icon: 'fas fa-save',
  iconColor: '#3498DB',
  ownable: false,
  stepable: true,
  templates: {},
  hooks: {
    // service: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'pushRow',
      humanName: 's-spreadsheets.events.pushRow.name',
      viewerTitle: 's-spreadsheets.events.pushRow.title',
      inputable: false,
      stepable: true,
      callback: () => {},
      templates: {
        eventConfig: 'servicesSpreadsheetCommonConfig'
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)