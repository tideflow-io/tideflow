import { Template } from 'meteor/templating'
import { servicesAvailable } from '/imports/services/_root/client'

Template.servicesIndexTableService.events({
  'click': (event, template) => {
    Router.go('services.one.edit', {
      _id: template.data._id,
      type: template.data.type
    })
  }
})