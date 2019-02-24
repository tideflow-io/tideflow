import { Meteor } from 'meteor/meteor'
import nodemailer from 'nodemailer'
import url from 'url'

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
    console.log(data.text)
  } }

/**
 * 
 * @param {*} to 
 * @param {*} emailDetails 
 * @param {*} tplVars 
 * @param {*} tplName 
 */
const data = (to, emailDetails, tplVars, tplName) => {
  to = to.filter(t => /^[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(t))

  return {
    from: 'Tideflow.io <no-reply@service.tideflow.io>',
    to: Array.isArray(to) ? to.join(' ') : to,
    subject: emailDetails.config ? emailDetails.config.subject || 'Tideflow.io' : 'Tideflow.io',
    text: emailDetails.config ? `Tideflow.io: ${emailDetails.config.body}` : 'Tideflow.io',
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
  transporter.sendMail(data, (error, body) => {
    if (error) throw new Meteor.Error(error)
  })
}

module.exports.send = send