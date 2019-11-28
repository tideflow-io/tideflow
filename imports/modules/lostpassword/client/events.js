import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { sAlert } from 'meteor/juliancwirko:s-alert'

import i18n from 'meteor/universe:i18n'

Template['membership.lostpassword'].events({
  'submit form': function(event) {
    event.preventDefault()
    let email = event.target.email.value
    Meteor.call('membership.lostpassword', {email}, (error) => {
      if (error) {
        sAlert.error(i18n.__('lostpassword.result.error'))
        return
      }
      sAlert.success(i18n.__('lostpassword.result.ok'))
    })
  }
})