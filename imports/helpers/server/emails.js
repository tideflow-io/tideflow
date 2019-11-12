import { Meteor } from 'meteor/meteor'
import nodemailer from 'nodemailer'
import url from 'url'

import { Settings } from '/imports/modules/management/both/collection'

SSR.compileTemplate('emailTemplatestandard', Assets.getText('emails/standard.html'));
SSR.compileTemplate('emailTemplateExecutionLogs', Assets.getText('emails/executionLogs.html'));
SSR.compileTemplate('emailTemplateflowEmailOnTriggered', Assets.getText('emails/flowEmailOnTriggered.html'));
SSR.compileTemplate('emailTemplateAccountsResetPassword', Assets.getText('emails/resetPassword.html'))
SSR.compileTemplate('emailTemplateAccountsVerifyEmail', Assets.getText('emails/verifyEmail.html'))

/**
 * Get the email configuration for Nodemailer
 */
const getConfig = () => {
  const processUrl = process.env.MAIL_URL
  const settingsUrl = Meteor.settings.MAIL_URL

  const mailString = processUrl || settingsUrl

  // if MAIL_URL or Meteor settings have been used,
  // parse the URL and create a config object
  if (mailString) {
    // parse the url
    const parsedUrl = url.parse(mailString)
    let { protocol, hostname, port, auth } = parsedUrl

    if (!protocol || protocol.trim() === '') return null
    if (!hostname || hostname.trim() === '') return null

    if (!protocol.includes('smtp')) {
      return null
    }

    const creds = !!auth && auth.split(':')
    port = Number(port)

    // create a nodemailer config from the SMTP url string
    const config = {
      host: hostname,
      port: port,
      secure: protocol.includes('smtps'),
      logger: process.env.NODE_ENV !== 'production',

      // add user/pass to the config object if they were found+
      auth: creds ? { user: creds[0], pass: creds[1] } : null
    }

    // don't enforce checking TLS on localhost
    if (hostname === 'localhost') {
      config.ignoreTLS = true
    }
    
    return config
  }

  return null
}

module.exports.getConfig = getConfig

const mailConfing = getConfig()

if (!mailConfing) {
  console.error('There is no MAIL_URL environment variable set.')
  console.error('Therefore, Tideflow will not send emails. Please check how')
  console.error('to solve this at https://docs.tideflow.io')
}

let transporter = mailConfing ? nodemailer.createTransport(getConfig()) : 
  { sendMail: (data, cb) => {
    console.info(`The email\'s text was: ${data.text}`)
  } }

/**
 * Builds the parameters needed to send an email
 * 
 * @param {Array} to List of email addresses
 * @param {Object} emailDetails 
 * @param {Object} tplVars 
 * @param {String} tplName 
 * 
 * @returns {Object}
 */
const data = (to, emailDetails, tplVars, tplName) => {
  const config = getConfig()

  // Validate target email addresses
  to = to.filter(t => /^[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(t))

  // Add common contents to the template variables
  const siteSettings = Settings.findOne({type: 'siteSettings'})
  const siteName = siteSettings.settings ? siteSettings.settings.title || 'Unnamed' : 'Unnamed'

  tplVars = (tplVars || {}).tideflow = {
    appUrl: '',
    name: siteName
  }

  return {
    from: `${siteName} <${config && config.auth ? config.auth.user : 'noreply@localhost'}>`,
    to: Array.isArray(to) ? to.join(' ') : to,
    subject: emailDetails.config ? emailDetails.config.subject || siteName : siteName,
    text: emailDetails.config ? `${siteName}: ${emailDetails.config.body}` : siteName,
    html: SSR.render(`emailTemplate${tplName}`, tplVars),
    attachments: []
  }
}

module.exports.data = data

/**
 * Sends an email
 * 
 * @param {object} data 
 */
const send = (data) => {
  Meteor.defer(function() {
    transporter.sendMail(data, (error, body) => {
      if (error) throw new Meteor.Error(error)
    })
  })
}

module.exports.send = send