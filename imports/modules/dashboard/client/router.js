import { Router } from 'meteor/iron:router'

import i18n from 'meteor/universe:i18n'

import './index.html'

Router.route('/dashboard', function () {
  this.render('dashboard')
}, {
  subscriptions: function () {
    return []
  },
  name: 'dashboard',
  title: i18n.__('dashboard.title'),
  parent: 'home'
})