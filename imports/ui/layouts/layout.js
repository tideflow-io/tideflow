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
    if (!Meteor.userId()) return
    let currentTeam = Router.current().params.teamId
    if (currentTeam === '0') {
      let firstTeam = Teams.findOne()
      console.log({firstTeam})
      if (!firstTeam) {
        //Router.go('teams.create')
      }
      else {
        Session.set('lastTeamId', firstTeam._id)
        Router.go('dashboard', {
          teamId: firstTeam._id
        })
      }
    }
    else {
      Meteor.subscribe('services.all', {
        team: currentTeam
      })
      
      Meteor.subscribe('flows.all', {
        team: currentTeam
      }, {
        fields: {
          team: true,
          title: true,
          descriptiom: true,
          status: true,
          trigger: true
        }
      })

    }
  })

  Meteor.subscribe('teams.all', {}, () => {
    let firstTeam = Teams.findOne()
    let currentTeam = Router.current().params.teamId
    if (currentTeam === '0') currentTeam = null
    if (!currentTeam) {
      if (!firstTeam) {
        Router.go('teams.create')
      }
      else {
        Session.set('lastTeamId', firstTeam._id)
      }
    }
    else {
      let team = Teams.findOne({
        _id: currentTeam
      })
      if (!team) {
        Router.go('teams.create')
        return;
      }
    }
  })

})