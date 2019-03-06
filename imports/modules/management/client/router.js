import { Router } from 'meteor/iron:router'
import { checkRole } from '/imports/helpers/both/roles'

import './ui/index'

Router.route('/management', function () {
  if (!checkRole(Meteor.userId(), 'super-admin')) {
    Router.go('home')
    return
  }
  this.render('management.index')
}, {
  name: 'management.index',
  title: 'Management',
  parent: 'home'
})
