import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'pdf',
  humanName: 's-pdf.name',
  inputable: false,
  stepable: true,
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
      name: 'build-pdf',
      humanName: 's-pdf.events.buildpdf.title',
      viewerTitle: 's-pdf.events.buildpdf.viewer.title',
      visibe: true,
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