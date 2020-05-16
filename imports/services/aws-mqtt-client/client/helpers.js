import { Template } from 'meteor/templating'

import { Services } from '/imports/modules/services/both/collection'

Template.servicesAwsCommonConfig.helpers({
  registeredProfiles: () => {
    return Services.find({type: 'aws'}).map(a => {
      return {
        _id: a._id,
        title: a.title
      }
    })
  }
})