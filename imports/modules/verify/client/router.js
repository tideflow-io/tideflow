import { Router } from 'meteor/iron:router'

Router.route('/verify/:token', function () {
  this.render('verify.index')
}, {
  subscriptions: function () {
    return []
  },
  data: function() {
    return {
      token: this.params.token
    }
  },
  name: 'membership.verify',
  title: 'Verify',
})