import { Router } from 'meteor/iron:router'

import i18n from 'meteor/universe:i18n'

import './index.html'

Router.route('/signup', function () {
  this.render('membership.signup')
}, {
  name: 'membership.signup',
  parent: 'home',
  title: i18n.__('signup.title')
})