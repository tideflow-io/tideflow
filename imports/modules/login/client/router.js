import { Router } from 'meteor/iron:router'

import i18n from 'meteor/universe:i18n'

import './index.html'

Router.route('/login', function () {
  if (Meteor.user()) {
    return Router.go('dashboard')
  }
  this.render('membership.login')
}, {
  name: 'membership.login',
  parent: 'home',
  title: i18n.__('login.title')
})