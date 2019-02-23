import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'

import i18n from 'meteor/universe:i18n'

Template['flows.one'].events({
  'change #updateFlowStatus select[name="status"]': (event, tpl) => {
    tpl.data.flow.status = event.target.value
    Meteor.call('flows.update', tpl.data.flow, (error, result) => {
      if (error) {
        sAlert.error(i18n.__('flows.status.update.error'))
        return
      }
      sAlert.success(i18n.__('flows.status.update.success'))
    })
  },
  'click .flows-one-delete': (event, template) => {
    event.preventDefault()
    event.stopPropagation()

    swal({
      title: i18n.__('flows.delete.title'),
      text: i18n.__('flows.delete.text'),
      icon: 'warning',
      buttons: true,
      dangerMode: true
    })
    .then(accepted => {
      if (accepted) {
        Meteor.call('flows.delete', {
          _id: template.data.flow._id
        }, (error) => {
          if (error) {
            sAlert.error(i18n.__('flows.delete.error'))
            return
          }
          sAlert.success(i18n.__('flows.delete.success'))
          Router.go('flows.index')
        })
      }
    })
  }
})

Template.flowOneExecutionSmallCardsCard.events({
  'click': (event, template) => {
    Router.go('flows.one.executionDetails', {
      _id: template.data.flow._id,
      executionId: template.data.execution._id
    })
  }
})