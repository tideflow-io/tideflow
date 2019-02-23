import { Router } from 'meteor/iron:router'

import i18n from 'meteor/universe:i18n'

import './index.html'

Router.route('/lostpassword', function () {
  this.render('membership.lostpassword')
}, {
  name: 'membership.lostpassword',
  parent: 'home',
  title: i18n.__('lostpassword.title')
})