import { Router } from 'meteor/iron:router'

Router.route('/profile/edit', function () {
  this.render('membership.profile.edit')
}, {
  name: 'membership.profile.edit'
})