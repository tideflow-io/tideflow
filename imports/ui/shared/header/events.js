import { Session } from 'meteor/session'
import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Router } from 'meteor/iron:router'

Template.appHeader.events({
  'click #logout': () => {
    Session.set('lastTeamId', null)
    Meteor.logout()
    Router.go('membership.login')
  }
})

Template.appHeaderTeam.events({
  'click': (event, template) => {
    Router.go('dashboard', {
      teamId: template.data._id
    })
  }
})