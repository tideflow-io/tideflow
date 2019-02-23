import { Template } from 'meteor/templating'
import { Accounts } from 'meteor/accounts-base'

import { sAlert } from 'meteor/juliancwirko:s-alert'

import i18n from 'meteor/universe:i18n'

Template.membershipEnrollaccount.events({
  'submit form': (event) => {
    event.preventDefault()
    const token = event.target.token.value
    const password = event.target.password.value
    const repeatpassword = event.target.repeatpassword.value

    if (password.length < 6) {
      sAlert.error(i18n.__('enroll.password.length'))
      return
    }

    if (password !== repeatpassword) {
      sAlert.error(i18n.__('enroll.password.mustmatch'))
      return
    }

    Accounts.resetPassword(token, password, (error) => {
      if (error) {
        sAlert.error(i18n.__('enroll.error'))
        return
      }
      sAlert.success(i18n.__('enroll.ok'))
    })
  }
})
