import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'

import i18n from 'meteor/universe:i18n'

Router.route('/', function () {
  if (Meteor.user()) {
    Router.go('dashboard')
  }
  else {
    Router.go('membership.login')
  }
}, {
  subscriptions: function () {
    return []
  },
  name: 'home',
  title: i18n.__('home.title')
})