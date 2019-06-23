import { Template } from 'meteor/templating'

import { Flows } from "/imports/modules/flows/both/collection.js"

Template['flows.index'].events({
  'click .flow-editor-link': (event) => {
    event.stopPropagation()
    document.location.reload(true)
  }
})

Template.flowsIndexListItem.events({
  'click .flow-toggle': (event, template) => {
    event.preventDefault()
    event.stopImmediatePropagation()
    template.data.status = template.data.status === 'enabled' ? 'disabled' : 'enabled'
    Meteor.call('flows.update', template.data)
  },
  'click .card': (event, template) => {
    event.stopPropagation()
    Router.go('flows.one', {_id: template.data._id})
  }
})