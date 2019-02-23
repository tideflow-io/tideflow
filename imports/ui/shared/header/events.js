import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Router } from 'meteor/iron:router'

Template.appHeader.events({
  'click #logout': () => {
    Meteor.logout()
    Router.go('membership.login')
  }
})