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

SSR.compileTemplate('emailFooter', Assets.getText('emails/footer.html'))
SSR.compileTemplate('emailHeader', Assets.getText('emails/header.html'))
SSR.compileTemplate('emailTemplatestandard', Assets.getText('emails/standard.html'));

SSR.compileTemplate('emailTemplateExecutionLogs', Assets.getText('emails/executionLogs.html'));

SSR.compileTemplate('emailTemplateflowEmailOnTriggered', Assets.getText('emails/flowEmailOnTriggered.html'));
SSR.compileTemplate('emailTemplateAccountsResetPassword', Assets.getText('emails/resetPassword.html'))
SSR.compileTemplate('emailTemplateAccountsVerifyEmail', Assets.getText('emails/verifyEmail.html'))

Accounts.emailTemplates.resetPassword = {
  subject(user) {
    return 'Reset your password'
  },
  text(user, url) {
    return 'To reset your password, simply click the link below:\n\n'
    + url
  },
  html(user, url) {
    const data = {
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
  text(user, url) {
    return 'To verify yuor email address, simply click the link below:\n\n' + url
  },
  html(user, url) {
    const urlParts = url.split('/')
    const token = urlParts[urlParts.length - 1]
    const data = {
      user,
      url: Meteor.absoluteUrl(`/verify/${token}`),
      title: i18n.__('emails.verify.title'),
      description: i18n.__('emails.verify.description'),
      buttonText: i18n.__('emails.verify.button')
    }
    return SSR.render('emailTemplateAccountsVerifyEmail', data)
  }
}