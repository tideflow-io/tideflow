import { Meteor } from 'meteor/meteor'
import nodemailer from 'nodemailer'
import url from 'url'

import { Settings } from '/imports/modules/management/both/collection'

/**
 * Get the email sending config for Nodemailer
 */
const getMailConfig = () => {
  const processUrl = process.env.MAIL_URL
  const settingsUrl = Meteor.settings.MAIL_URL

  const mailString = processUrl || settingsUrl

  // if MAIL_URL or Meteor settings have been used,
  // parse the URL and create a config object
  if (mailString) {
    // parse the url
    const parsedUrl = url.parse(mailString)
    const creds = !!parsedUrl.auth && parsedUrl.auth.split(':')
    parsedUrl.port = Number(parsedUrl.port)

    // create a nodemailer config from the SMTP url string
    const config = {
      host: parsedUrl.hostname,
      port: parsedUrl.port,
      secure: parsedUrl.port === 465,
      logger: process.env.NODE_ENV !== 'production'
    }

    // add user/pass to the config object if they were found
    if (creds) {
      config.auth = {
        user: creds[0],
        pass: creds[1]
      }
    }

    // don't enforce checking TLS on localhost
    if (parsedUrl.hostname === 'localhost') {
      config.ignoreTLS = true
    }
    
    return config
  }

  return null
}

const mailConfing = getMailConfig()

let transporter = mailConfing ? nodemailer.createTransport(getMailConfig()) : 
  { sendMail: (data, cb) => {
    console.info('There is no MAIL_URL environment variable set.')
    console.info('Therefore, Tideflow can not send emails. Please check how')
    console.info('to solve this at https://docs.tideflow.io.\m\m')
    console.info(`The email\'s text was: ${data.text}`)
  } }

/**
 * 
 * @param {Array} to List of email addresses
 * @param {*} emailDetails 
 * @param {Object} tplVars 
 * @param {String} tplName 
 */
const data = (to, emailDetails, tplVars, tplName) => {
  // Validate target email addresses
  to = to.filter(t => /^[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(t))

  // Add common contents to the template variables
  const siteSettings = Settings.findOne({type: 'siteSettings'})
  const siteName = siteSettings.settings ? siteSettings.settings.title || 'Unnamed' : 'Unnamed'

  tplVars.tideflow = {
    appUrl: '',
    name: siteName
  }

  return {
    from: `${siteName} <${mailConfing.auth.user}>`,
    to: Array.isArray(to) ? to.join(' ') : to,
    subject: emailDetails.config ? emailDetails.config.subject || siteName : siteName,
    text: emailDetails.config ? `${siteName}: ${emailDetails.config.body}` : siteName,
    html: SSR.render(`emailTemplate${tplName}`, tplVars),
    attachments: []
  }
}

module.exports.data = data

/**
 * 
 * @param {*} data 
 */
const send = (data) => {
  Meteor.defer(function() {
    transporter.sendMail(data, (error, body) => {
      if (error) throw new Meteor.Error(error)
    })
  })
}

module.exports.send = send