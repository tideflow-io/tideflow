import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { Settings } from '/imports/modules/management/both/collection'
import { siteName } from '/imports/helpers/both/tideflow'

import i18n from 'meteor/universe:i18n'

const mailSiteName = siteName()

Accounts.urls = {
  resetPassword: (token) => Meteor.absoluteUrl('resetpassword/' + token),
  verifyEmail: (token) => Meteor.absoluteUrl('verify/' + token),
  enrollAccount: (token) => Meteor.absoluteUrl('enroll-account/' + token),
}

Accounts.emailTemplates.siteName = mailSiteName
Accounts.emailTemplates.from = `${mailSiteName} <no-reply@service.tideflow.io>`

Accounts.emailTemplates.resetPassword = {
  subject(_user) {
    return 'Reset your password'
  },
  text(_user, url) {
    return 'To reset your password, simply click the link below:\n\n'
    + url
  },
  html(user, url) {
    const data = {
      tideflow: {
        appUrl: Meteor.absoluteUrl(),
        name: mailSiteName
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

Accounts.emailTemplates.enrollAccount = {
  subject(user) {
    return `Invitation for joining ${mailSiteName}`
  },
  text(_user, url) {
    return `You are invited to join ${ mailSiteName }, click ${ url } to set up your account and join.`; 
  },
  html(user, url, abc) {
    // Add common contents to the template variables

    const data = {
      tideflow: {
        appUrl: Meteor.absoluteUrl(),
        name: mailSiteName
      },
      user,
      url,
      title: i18n.__('emails.enroll.title', {mailSiteName}),
      description: i18n.__('emails.enroll.description', {mailSiteName}),
      buttonText: i18n.__('emails.enroll.button', {mailSiteName})
    }
    return SSR.render('emailTemplateAccountsEnrollEmail', data)
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
    const urlParts = url.split('/')
    const token = urlParts[urlParts.length - 1]
    const data = {
      tideflow: {
        appUrl: Meteor.absoluteUrl(),
        name: mailSiteName
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