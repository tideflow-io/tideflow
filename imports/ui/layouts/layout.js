import { Router } from 'meteor/iron:router'
import { Session } from 'meteor/session'

import { Teams } from '/imports/modules/teams/both/collection'

import './404'

import './applicationLayout.html'
import './membershipLayout.html'

import '../stylesheets/base.css'
import '../stylesheets/bootstrap-theme.css'

Router.configure({
  layoutTemplate: 'MembershipLayout'
})

Template.ApplicationLayout.onRendered(function() {
  this.autorun(function () {
    Meteor.subscribe('teams.all', {}, () => {
      let firstTeam = Teams.findOne()
      if (!Router.current().params.teamId) {
        if (!firstTeam) {
          Router.go('teams.create')
        }
        else {
          Router.go('dashboard', {
            teamId: firstTeam._id
          })
        }
      }
      else {
        let team = Teams.findOne({
          _id: Router.current().params.teamId
        })
        if (!team) {
          Router.go('teams.create')
          return;
        }
      }
    })

    const teamId = Router.current().params.teamId
    if (!teamId) return;

    Meteor.subscribe('services.all', {
      team: teamId
    })
    
    Meteor.subscribe('flows.all', {
      team: teamId
    }, {
      fields: {
        team: true,
        title: true,
        descriptiom: true,
        status: true,
        trigger: true
      }
    })
  })
  
  
})