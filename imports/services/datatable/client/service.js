import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'datatable',
  humanName: 's-datatable.name',
  description: 's-datatable.description',
  website: 'https://docs.tideflow.io/docs/services-datatables',
  icon: 'fas fa-table',
  iconColor: '#FF3031',
  ownable: true,
  templates: {
    detailsView: 'servicesDatatableDetailsView',
  },
  hooks: {
    // channel: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'record-update',
      humanName: 's-datatable.events.record-update.name',
      viewerTitle: 's-datatable.events.record-update.viewer.title',
      inputable: true,
      stepable: false,
      callback: () => {},
      conditions: [
        // {}
      ]
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)