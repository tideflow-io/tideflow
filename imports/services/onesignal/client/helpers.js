import { Template } from 'meteor/templating'

import { Services } from '/imports/modules/services/both/collection'

Template.servicesOnesignalCommonConfig.helpers({
  registeredApplications: () => {
    return Services.find({type: 'onesignal'}).map(a => {
      return {
        _id: a._id,
        title: a.title
      }
    })
  }
})