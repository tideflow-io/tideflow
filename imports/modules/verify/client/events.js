import i18n from 'meteor/universe:i18n'
import { Session } from 'meteor/session'
import { Router } from 'meteor/iron:router'
import { Accounts } from 'meteor/accounts-base'

import { Template } from 'meteor/templating'

Template.verifyIndex.onRendered(function() {
  let instance = this
  Session.set('verifyMessage', null)
  Accounts.verifyEmail(instance.data.token, (error, result) => {
    if (error) {
      Session.set('verifyMessage', i18n.__('verify.error'))
      return
    }
    Router.go('home')
  })
})