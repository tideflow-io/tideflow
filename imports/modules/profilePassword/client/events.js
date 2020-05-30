import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Accounts } from 'meteor/accounts-base'

import { sAlert } from 'meteor/juliancwirko:s-alert'

import i18n from 'meteor/universe:i18n'

Template['membership.profile.password'].events({
  'submit form': function (event) {
    event.preventDefault()
    let currentPassword = event.target.currentPassword.value
    let newPassword = event.target.newPassword.value
    let repeatNewPassword = event.target.repeatNewPassword.value
    
    if (newPassword.length < 6) {
      sAlert.error(i18n.__('profilePassword.password.length'))
      return
    }

    if (newPassword !== repeatNewPassword) {
      sAlert.error(i18n.__('profilePassword.password.mustmatch'))
      return
    }

    Accounts.changePassword(currentPassword, newPassword, (error) => {
      if (error) {
        sAlert.error(i18n.__('profilePassword.change.error'))
      } else {
        sAlert.success(i18n.__('profilePassword.change.success'))

        event.target.currentPassword.value = ''
        event.target.newPassword.value = ''
        event.target.repeatNewPassword.value = ''
      }
    })
  },
  'click #recoverPassword': function(event) {
    event.preventDefault()

    Meteor.call('profile.password.recover', (error) => {
      if (error) {
        sAlert.error(i18n.__('profilePassword.recover.error'))
      } else {
        sAlert.success(i18n.__('profilePassword.recover.success'))
      }
    })
  }
})