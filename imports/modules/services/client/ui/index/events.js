import { Template } from 'meteor/templating'
import { Router } from 'meteor/iron:router'

Template.servicesIndexTableService.events({
  'click': (event, template) => {
    Router.go('services.one.edit', {
      teamId: Router.current().params.teamId,
      _id: template.data._id,
      type: template.data.type
    })
  }
})