import i18n from 'meteor/universe:i18n'
import { Router } from 'meteor/iron:router'
import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { sAlert } from 'meteor/juliancwirko:s-alert'

Template['flows.one.edit'].events({
  'click .flows-one-delete': (event, template) => {
    event.preventDefault()
    event.stopPropagation()

    swal({
      title: i18n.__('flows.delete.title'),
      text: i18n.__('flows.delete.text'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      animation: false
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