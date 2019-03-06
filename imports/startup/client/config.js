import { Meteor } from "meteor/meteor"
import { Router } from 'meteor/iron:router'
import { AutoForm } from "meteor/aldeed:autoform"

import i18n from 'meteor/universe:i18n'

// Extra logging for Autoform. Turn off in production!
AutoForm.debug()

Router.onBeforeAction(function () {
  if  (!Meteor.userId() && !Meteor.loggingIn()) {
    this.redirect('membership.login')
    this.stop()
  } else {
    this.layout('ApplicationLayout')
    this.next()
  }
}, { except: [
  'install.index',
  'install.finished',
  'membership.verify',
  'membership.login',
  'membership.signup',
  'membership.lostpassword',
  'membership.enrollment',
  'membership.resetpassword',
]})

Router.configure({
  notFoundTemplate: 'notFound'
})

// somewhere in the page layout (or possibly in the router?)
function getLang () {
  let r = (
    navigator.languages && navigator.languages[0] ||
    navigator.language ||
    navigator.browserLanguage ||
    navigator.userLanguage ||
    'en-US'
  )
  return r
}

i18n.setLocale(getLang())