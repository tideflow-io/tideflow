import { Router } from 'meteor/iron:router'

import './ui/index'

Router.route('/management', function () {
  this.render('management.index')
}, {
  name: 'management.index',
  title: 'Management',
  parent: 'home'
})
