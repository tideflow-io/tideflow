import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'

import './index.html'

Router.route('/enroll-account/:token', function () {
  if (Meteor.user()) {
    return Router.go('dashboard', {
      teamId: '0'
    })
  }
  this.render('membershipEnrollaccount', 
    {
      data: {token: this.params.token}
    }
  )
}, {
  subscriptions: function () {
    return []
  },
  name: 'membership.enrollment',
  title: 'Crea tu contraseña'
})