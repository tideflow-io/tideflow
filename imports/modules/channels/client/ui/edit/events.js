import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'
import { Template } from 'meteor/templating'

import i18n from 'meteor/universe:i18n'

Template['channels.one.edit'].events({
  'click .delete-channel': (event, template) => {
    event.preventDefault()
    event.stopPropagation()

    swal({
      title: i18n.__('channels.delete.title'),
      text: i18n.__('channels.delete.text'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      animation: false
    })
    .then(accepted => {
      if (accepted) {
        Meteor.call('channels.delete', {
          _id: template.data.channel._id
        }, (error) => {
          if (error) {
            sAlert.error(i18n.__('channels.delete.error'))
            return
          }
          sAlert.success(i18n.__('channels.delete.success'))
          Router.go('channels.index')
        })
      } 
    })
  }
})