import { Session } from 'meteor/session'
import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { moment } from 'meteor/momentjs:moment'
import { Teams } from '/imports/modules/teams/both/collection'
import { checkRole } from '/imports/helpers/both/roles'

import { Settings } from '/imports/modules/management/both/collection'
import * as emailHelper from '/imports/helpers/both/emails'

Template.registerHelper('currentTeamId', () => {
  try {
    let c = Router.current().params.teamId
    if (c) Session.set('lastTeamId', c) 
    else c = Session.get('lastTeamId') 
    return c
  }
  catch (ex) {
    return null
  }
})

Template.registerHelper('fileSizeKb', size => {
  if (size === 0) return '0 Kb'
  if (!size) return ''
  let kb = (size / 1024).toFixed(2)
  return kb > 1024 ? 
    `${(kb / 1024).toFixed(2)} Mb` : 
    `${kb} Kb`
})

Template.registerHelper('absoluteUrl', () => Meteor.absoluteUrl())

Template.registerHelper('agentUrl', () => {
  const url = new URL(Meteor.absoluteUrl())
  return `${url.protocol}//${url.hostname}`
})

Template.registerHelper('checkUserRole', (team) => {
  return checkRole(Meteor.userId(), team)
})

Template.registerHelper('isInUrl', url => {
  if (!url) return null
  if (!Router.current().route.path()) return null
  return Router.current().route.path().indexOf(url) === 1
})

Template.registerHelper('routeIs', routeName => Router.current().route.getName() === routeName)
Template.registerHelper('routeContains', routeName => Router.current().route.getName().indexOf(routeName) >= 0)







Template.registerHelper('sessVal', (name) => Session.get(name))

Template.registerHelper('prop', (obj, prop) => {
  return (obj && obj[prop]) ? obj[prop] : ''
})

Template.registerHelper('debug', (a) => console.log(a))

Template.registerHelper('sessIsSet', name => typeof Session.get(name) !== 'undefined')
Template.registerHelper('sessEq', (name, val) => {
  if (val === null && !Session.get(name)) { return true }
  return Session.get(name) ? Session.get(name) === val : false
})

Template.registerHelper('extendedDate', (date) => moment(date).format('D MMMM YYYY'))
Template.registerHelper('executionHappened', (date) => {
  return moment(date).format('YYYY.MM.DD HH:mm:ss')
})

Template.registerHelper('arrayIsEmpty', (i) => i.length === 0)
Template.registerHelper('cursorIsEmpty', (i) => {
  return !i || Array.isArray(i) ? !i.length : i.count() === 0
})

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
    case 'stopped':
      return 'stopped'
    default:
      return 'empty' 
  }
})

Template.registerHelper('fromNow', (date) => {
  if (!date) return null;
  return moment(date).fromNow()
})

Template.registerHelper('userEmail', function(user) {
  if (!user && !Meteor.user()) { return false }
  
  return emailHelper.userEmail(user || Meteor.user())
})

Template.registerHelper('userName', function(user) {
  if (!user && !Meteor.user()) { return false }

  let fn = (user || Meteor.user()).profile ? (user || Meteor.user()).profile.firstName : ''
  if (!fn || fn.trim() === '') {
    return false
  }
  else {
    return fn
  }
})

Template.registerHelper('currentTeamProperty', (prop, prefix) => {
  let c = Session.get('lastTeamId') 
  if (!c) return null

  let t = Teams.findOne({_id: c})
  return t ? `${prefix || ''}${t[prop]}` : null
})
