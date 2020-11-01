import { Template } from 'meteor/templating'
import { Router } from 'meteor/iron:router'

import { copyTextToClipboard } from '/imports/helpers/client/clipboard/helper'

Template.servicesIndexTableService.events({
  'click .copy-s-webform-url': (event, template) => {
    event.preventDefault()
    event.stopPropagation()
    copyTextToClipboard(`${Meteor.absoluteUrl()}webform/${template.data.config.endpoint}`)
  },
  'click .row': (event, template) => {
    Router.go('services.one.edit', {
      teamId: Router.current().params.teamId,
      _id: template.data._id,
      type: template.data.type
    })
  }
})
