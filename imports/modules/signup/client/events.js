import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'

import { Router } from 'meteor/iron:router'
import { sAlert } from 'meteor/juliancwirko:s-alert'

import i18n from 'meteor/universe:i18n'

Template['membership.signup'].events({
  'submit form': function(event) {
    
    event.preventDefault()
    let name = event.target.name.value
    let email = event.target.email.value
    let password = event.target.password.value

    if (password.length < 6) {
      sAlert.error(i18n.__('signup.password.length'))
      return
    }

    const userData = { email, password, profile: {
      firstName: name
    }}

    Meteor.call('membership.create', userData, (error, result) => {
      if (error) {
        if (error.reason === 'Email already exists.') {
          sAlert.error(i18n.__('signup.email.alreadyExists'))
        }
        else {
          sAlert.error(i18n.__('signup.error'))
        }
        return
      }

      sAlert.success(i18n.__('signup.success.title'))
    })
  }
})