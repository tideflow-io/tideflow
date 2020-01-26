import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { sAlert } from 'meteor/juliancwirko:s-alert'

import i18n from 'meteor/universe:i18n'

Template['membership.login'].events({
  'submit form': function(event) {
    event.preventDefault()
    let email = event.target.email.value
    let password = event.target.password.value
    Meteor.loginWithPassword(email, password, (error) => {
      if (error) {
        if (error.error === 'email-not-verified') {
          sAlert.error(i18n.__('login.index.notverified'))
        }
        else {
          sAlert.error(error.reason)
        }
      }
    })
  }
})