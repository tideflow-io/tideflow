import { Router } from 'meteor/iron:router'

import i18n from 'meteor/universe:i18n'

Router.route('/profile', function () {
  this.render('membership.profile.index')
}, {
  name: 'membership.profile.index',
  title: i18n.__('profile.title'),
  parent: 'home'
})
