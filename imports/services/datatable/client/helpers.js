import { Template } from 'meteor/templating'
import { ServiceDataTableRecords } from '../both/collection.js'
import { Channels } from '/imports/modules/channels/both/collection.js'

Template.servicesDatatableDetailsView.helpers({
  records: () => {
    const dtId = Router.current().params._id
    return ServiceDataTableRecords.find({
      channel: dtId
    })
  }
})

Template.servicesDatatableExecuteConfig.helpers({
  datatables: () => {
    return Channels.find({type: 'datatable'}).map(a => {
      return {
        _id: a._id,
        title: a.title
      }
    })
  },
  selectedDatatable: function(compare) {
    return this._id === compare ? 'selected' : ''
  }
})