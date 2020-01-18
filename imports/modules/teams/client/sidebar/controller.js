import { Router } from 'meteor/iron:router'
import { Session } from 'meteor/session'
import { Template } from 'meteor/templating'
import { Teams } from '../../both/collection.js'

Template.teamsSidebar.helpers({
  'teams': () => {
    return Teams.find()
  },
  'activeTeam': (template) => {
    return template.data._id === Session.get('currentTeamId')
  }
})

Template.teamsSidebarTeam.events({
  'click': (event, template) => {
    if (template.data._id === Session.get('currentTeamId')) return;
    console.log('template.data._id', template.data._id)
    Session.set('currentTeamId', template.data._id)
    Router.go('dashboard')
  }
})