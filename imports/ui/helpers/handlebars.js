import { Template } from 'meteor/templating'
import { moment } from 'meteor/momentjs:moment'

import { Settings } from '/imports/modules/management/both/collection'
import * as emailHelper from '/imports/helpers/both/emails'

Template.registerHelper('sessVal', (name) => Session.get(name))

Template.registerHelper('prop', (obj, prop) => {
  return (obj && obj[prop]) ? obj[prop] : ''
})

Template.registerHelper('debug', (a) => console.log(a))

Template.registerHelper('sessEq', (name, val) => Session.get(name) ? Session.get(name) === val : false)

Template.registerHelper('simpleDate', (date) => moment(date).format('D MMMM'))

Template.registerHelper('arrayIsEmpty', (i) => i.length === 0)
Template.registerHelper('cursorIsEmpty', (i) => i.count() === 0)

Template.registerHelper('substr', (i, n) => (i || '').substr(0, n))

Template.registerHelper('isEq', (a,b) => a === b)

Template.registerHelper('showSignup', () => {
  const st = Settings.findOne({
    type: 'siteSettings'
  })
  return st && st.settings ? ['public', 'domain'].indexOf(st.settings.signupsType)>=0 : false
})

Template.registerHelper('logDate', date => {
  if (!date) return
  return moment(date).format('YYYYMMDD-HH:mm:ss.SSS')
})

Template.registerHelper('logLapsedInSeconds', function() {
  if (!this || !this.log || !this.log.createdAt || !this.log.updatedAt) return;
  return moment.utc(moment(this.log.updatedAt).diff(this.log.createdAt)).format('mm:ss')
})

Template.registerHelper('logStatusCssClass', function() {
  if (!this || !this.log) return;
  switch(this.log.status || null) {
    case 'success':
      return this.log.status
    case 'error':
      return 'danger'
    default:
      return 'empty' 
  }
})

Template.registerHelper('fromNow', (date) => {
  if (!date) return null;
  return moment(date).fromNow()
})

Template.registerHelper('userEmail', function(user) {
  return emailHelper.userEmail(user || Meteor.user())
})

Template.registerHelper('userName', function(user) {
  let fn = (user || Meteor.user()).profile ? (user || Meteor.user()).profile.firstName : ''
  if (!fn || fn.trim() === '') {
    return false
  }
  else {
    return fn
  }
})

const random = (list) => list[Math.floor((Math.random()*list.length))]
