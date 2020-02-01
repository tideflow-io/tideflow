import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'
import { checkRole } from '/imports/helpers/both/roles'

import './ui/index'
import './ui/users'
import './ui/permissions'
import './ui/teams'

Router.route('/management', function () {
  if (!checkRole(Meteor.userId(), 'super-admin')) {
    Router.go('home')
    return
  }
  this.render('management.index')
}, {
  name: 'management.index',
  title: 'Management',
  parent: 'home'
})

Router.route('/management/users', function () {
  if (!checkRole(Meteor.userId(), 'super-admin')) {
    Router.go('home')
    return
  }
  this.render('management.users')
}, {
  name: 'management.users',
  title: 'Users',
  parent: 'management.index'
})

Router.route('/management/permissions', function () {
  if (!checkRole(Meteor.userId(), 'super-admin')) {
    Router.go('home')
    return
  }
  this.render('management.permissions')
}, {
  name: 'management.permissions',
  title: 'Permissions',
  parent: 'management.index'
})

Router.route('/management/teams', function () {
  if (!checkRole(Meteor.userId(), 'super-admin')) {
    Router.go('home')
    return
  }
  this.render('management.teams')
}, {
  name: 'management.teams',
  title: 'Teams',
  parent: 'management.index'
})
