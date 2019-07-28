import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'

import { sAlert } from 'meteor/juliancwirko:s-alert'

import i18n from 'meteor/universe:i18n'

Template['install.index'].events({
  'submit form': function(event) {
    event.preventDefault()
    let siteName = event.target['site-name'].value
    let userName = event.target['user-name'].value
    let email = event.target['email-address'].value
    let password = event.target.password.value

    if (password.length < 6) {
      sAlert.error(i18n.__('signup.password.length'))
      return
    }

    const installationDetails = {
      siteName, userName, email, password
    }

    Meteor.call('install-platform', installationDetails, (error, result) => {
      if (error) {
        console.error(error)
        sAlert.error(i18n.__('install.submit.error'))
        return
      }

      Router.go('install.finished')
    })
  }
})