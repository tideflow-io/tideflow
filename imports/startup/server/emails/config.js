import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { Settings } from '/imports/modules/management/both/collection'

import i18n from 'meteor/universe:i18n'

const siteSettings = Settings.findOne({type: 'siteSettings'}) || {}
const siteName = siteSettings.settings ? siteSettings.settings.title || 'Unnamed' : 'Unnamed'

Accounts.urls.resetPassword = function(token) {
  return Meteor.absoluteUrl('resetpassword/' + token)
}

Accounts.emailTemplates.siteName = siteName
Accounts.emailTemplates.from = `${siteName} <no-reply@service.tideflow.io>`

Accounts.emailTemplates.resetPassword = {
  subject(_user) {
    return 'Reset your password'
  },
  text(_user, url) {
    return 'To reset your password, simply click the link below:\n\n'
    + url
  },
  html(user, url) {
    // Add common contents to the template variables
    const siteSettings = Settings.findOne({type: 'siteSettings'})
    const siteName = siteSettings.settings ? siteSettings.settings.title || 'Tideflow' : 'Tideflow'

    const data = {
      tideflow: {
        appUrl: '',
        name: siteName
      },
      user,
      url,
      title: i18n.__('emails.resetPassword.title'),
      description: i18n.__('emails.resetPassword.description'),
      buttonText: i18n.__('emails.resetPassword.button')
    }
    return SSR.render('emailTemplateAccountsResetPassword', data)
  }
}

Accounts.emailTemplates.verifyEmail = {
  subject() {
    return 'Verify your email'
  },
  text(_user, url) {
    return 'To verify yuor email address, simply click the link below:\n\n' + url
  },
  html(user, url) {
    // Add common contents to the template variables
    const siteSettings = Settings.findOne({type: 'siteSettings'})
    const siteName = siteSettings.settings ? siteSettings.settings.title || 'Tideflow' : 'Tideflow'

    const urlParts = url.split('/')
    const token = urlParts[urlParts.length - 1]
    const data = {
      tideflow: {
        appUrl: '',
        name: siteName
      },
      user,
      url: Meteor.absoluteUrl(`/verify/${token}`),
      title: i18n.__('emails.verify.title'),
      description: i18n.__('emails.verify.description'),
      buttonText: i18n.__('emails.verify.button')
    }
    return SSR.render('emailTemplateAccountsVerifyEmail', data)
  }
}