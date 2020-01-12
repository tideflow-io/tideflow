import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { sAlert } from 'meteor/juliancwirko:s-alert'
var QRCode = require('qrcode')

import i18n from 'meteor/universe:i18n'

Template['membership.profile.keys'].events({
  'click .create-key': function(event, template) {
    Meteor.call('profileKeys.create', async (error, result) => {
      if (error) {
        sAlert.error(i18n.__('profileKeys.create.error'))
        return
      }
      const content = document.createElement('div')
      content.innerHTML = `
        <input class="form-control" onClick="this.select();" focus type="text" value="${result}">`
      swal({
        icon: await QRCode.toDataURL(`{url: '${Meteor.absoluteUrl()}', key:'${result}'}`),
        title: i18n.__('profileKeys.create.success'),
        text: i18n.__('profileKeys.create.copyNow'),
        content
      })
        .then(() => location.reload())
    })
  }
})

Template['membershipProfileKeysOne'].events({
  'click .delete-key': function(event, template) {
    event.preventDefault()
    
    swal({
      title: i18n.__('profileKeys.delete.title'),
      text: i18n.__('profileKeys.delete.text'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      animation: false
    })
      .then(accepted => {
        if (accepted) {
          Meteor.call('profileKeys.remove', {
            _id: template.data._id
          }, (error) => {
            if (error) {
              sAlert.error(i18n.__('profileKeys.delete.error'))
              return
            }
            sAlert.success(i18n.__('profileKeys.delete.success'))
            location.reload()
          })
        }
      })
  }
})