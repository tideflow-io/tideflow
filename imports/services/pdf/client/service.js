import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'pdf',
  description: 's-pdf.description',
  humanName: 's-pdf.name',
  icon: 'far fa-file-pdf',
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
      name: 'create-from-html',
      humanName: 's-pdf.events.create-from-html.title',
      viewerTitle: 's-pdf.events.create-from-html.viewer.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} },
      templates: {
        eventConfig: 'servicesPdfCreateFromHtmlConfig'
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)