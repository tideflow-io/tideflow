import { Router } from 'meteor/iron:router'

import i18n from 'meteor/universe:i18n'

Router.route('/profile/password', function () {
  this.render('membership.profile.password')
}, {
  name: 'membership.profile.password',
  parent: 'membership.profile.index',
  title: i18n.__('profilePassword.title')
})