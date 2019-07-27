import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'pdf',
  description: 's-pdf.description',
  humanName: 's-pdf.name',
  icon: 'far fa-file-pdf',
  iconColor: '#ff0000',
  ownable: false,
  templates: {
  },
  hooks: {
    // service: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'build-pdf',
      humanName: 's-pdf.events.buildpdf.title',
      viewerTitle: 's-pdf.events.buildpdf.viewer.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} },
      templates: {
        eventConfig: 'servicesPdfBuildPdfConfig'
      },
      conditions: [
        // {}
      ]
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)