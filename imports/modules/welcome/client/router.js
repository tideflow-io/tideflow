import { Router } from 'meteor/iron:router'

Router.route('/welcome', function () {
  this.render('welcome.index')
}, {
  subscriptions: function () {
    return []
  },
  data: function() {
    return {
      token: this.params.token
    }
  },
  name: 'welcome',
  title: 'Welcome',
})