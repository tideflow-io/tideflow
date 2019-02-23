import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Accounts } from 'meteor/accounts-base'

import { Router } from 'meteor/iron:router'
import { sAlert } from 'meteor/juliancwirko:s-alert'

import i18n from 'meteor/universe:i18n'

Template['membership.resetpassword'].events({
  'submit form': function(event) {
    event.preventDefault()
    let token = event.target.token.value
    let password = event.target.password.value
    let repassword = event.target.repassword.value

    if (password.length < 6) {
      sAlert.error(i18n.__('resetpassword.password.length'))
      return
    }

    if (password !== repassword) {
      sAlert.error(i18n.__('resetpassword.password.mustmatch'))
      return
    }

    Accounts.resetPassword( token, password, ( error ) =>{
      if ( error ) {
        if (error.reason === 'Token expired') {
          sAlert.error(i18n.__('resetpassword.incorrectLink'))
        }
        else {
          sAlert.error(i18n.__('resetpassword.error'))
        }
      } 
      else {
        Router.go('dashboard')
        sAlert.success(i18n.__('resetpassword.ok'))
      }
    })
  }
})