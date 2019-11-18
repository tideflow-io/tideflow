import { Meteor } from 'meteor/meteor'

import i18n from 'meteor/universe:i18n'
import { sAlert } from 'meteor/juliancwirko:s-alert'
import { Template } from 'meteor/templating'
import { Router } from 'meteor/iron:router'

Template.filesIndexElement.events({
  'click .card': (event, template) => {
    event.stopPropagation()
    Router.go('files.one.edit', {_id: template.data._id})
  },
  'click .card .dropdown-toggle': (event, template) => {
    event.stopPropagation()
    $(event.target).dropdown('toggle')
  },
  'click .card .files-one-delete': (event, template) => {
    event.preventDefault()
    event.stopPropagation()

    swal({
      title: i18n.__('files.delete.title'),
      text: i18n.__('files.delete.text'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      animation: false
    })
      .then(accepted => {
        if (accepted) {
          Meteor.call('files.delete', {
            _id: template.data._id
          }, (error) => {
            if (error) {
              sAlert.error(i18n.__('files.delete.error'))
              return
            }
            sAlert.success(i18n.__('files.delete.success'))
            Router.go('files.index')
          })
        }
      })
  }
})