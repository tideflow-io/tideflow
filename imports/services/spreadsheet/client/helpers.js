import { Template } from 'meteor/templating'

import { Services } from '/imports/modules/services/both/collection'
import { Files } from '/imports/modules/files/both/collection'

Template.servicesSpreadsheetCommonConfig.helpers({
  registeredAgents: () => {
    return Services.find({type: 'agent'}).map(a => {
      return {
        _id: a._id,
        title: a.title
      }
    })
  },
  files: function () {
    return Files.find()
  }
})