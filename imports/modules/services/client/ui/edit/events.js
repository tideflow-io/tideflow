import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'
import { Template } from 'meteor/templating'
import { sAlert } from 'meteor/juliancwirko:s-alert'
import i18n from 'meteor/universe:i18n'

Template['services.one.edit'].events({
  'click .delete-service': (event, template) => {
    event.preventDefault()
    event.stopPropagation()

    swal({
      title: i18n.__('services.delete.title'),
      text: i18n.__('services.delete.text'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      animation: false
    })
      .then(accepted => {
        if (accepted) {
          Meteor.call('services.delete', {
            _id: template.data.service._id
          }, (error) => {
            if (error) {
              sAlert.error(i18n.__('services.delete.error'))
              return
            }
            sAlert.success(i18n.__('services.delete.success'))
            Router.go('services.index', {
              teamId: Router.current().params.teamId
            })
          })
        } 
      })
  }
})