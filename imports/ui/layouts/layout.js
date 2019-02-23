import { Router } from 'meteor/iron:router'

import './404'

import './applicationLayout.html'
import './membershipLayout.html'

import '../stylesheets/base.css'
import '../stylesheets/bootstrap-theme.css'

Router.configure({
  layoutTemplate: 'MembershipLayout'
})