import { Template } from 'meteor/templating'
import { Router } from 'meteor/iron:router'

Template.servicesNewTableService.events({
  'click': (event, template) => {
    Router.go('services.new.type', {
      type: template.data.name
    })
  }
})