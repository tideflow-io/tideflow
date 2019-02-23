import { Router } from 'meteor/iron:router'

import './index.html'

Router.route('/resetpassword/:token', function () {
  this.render('membership.resetpassword')
}, {
  data: function() {
    return {
      token: this.params.token
    }
  },
  name: 'membership.resetpassword'
})
