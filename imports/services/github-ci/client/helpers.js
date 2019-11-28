import { Template } from 'meteor/templating'

import { Services } from '/imports/modules/services/both/collection.js'
import { Files } from '/imports/modules/files/both/collection.js'

Template.servicesGhCiTriggerEditorPre.helpers({
  registeredRepositories: function() {
    let _id = $('[name="triggerSelector"]').val()
    let service = Services.findOne({_id})
    let result = []
    try {
      result = _.flatten( service.details.installations.map(installation => installation.repositories) ) 
    }
    catch (ex) {

    }
    finally {
      return result
    }
  },
  selectedRepository: function(compare) {
    return this.id === compare ? 'selected' : ''
  }
})

Template.servicesGhCiTriggerEditorPost.helpers({
  registeredAgents: () => {
    return Services.find({type: 'agent'}).map(a => {
      return {
        _id: a._id,
        title: a.title
      }
    })
  }
})

Template['servicesGithubCiBasicStep'].helpers({
  files: function () {
    return Files.find()
  }
})