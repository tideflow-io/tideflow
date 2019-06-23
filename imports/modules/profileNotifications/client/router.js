import { Router } from 'meteor/iron:router'

Router.route('/profile/notifications', function () {
  this.render('membership.profile.notifications')
}, {
  name: 'membership.profile.notifications',
  title: i18n.__('profileNotifications.title'),
  parent: 'membership.profile.index'
})