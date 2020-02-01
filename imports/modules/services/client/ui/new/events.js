import { Template } from 'meteor/templating'
import { Router } from 'meteor/iron:router'

Template.servicesNewTableService.events({
  'click': (event, template) => {
    Router.go('services.new.type', {
      teamId: Router.current().params.teamId,
      type: template.data.name
    })
  }
})