import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'
import { Session } from 'meteor/session'

import { Teams } from '/imports/modules/teams/both/collection'

Meteor.startup( function() {
  Meteor.subscribe('settings.public.all')
  Meteor.subscribe('services.all', {})

  Meteor.subscribe('teams.all', {}, () => {
    if (!Session.get('currentTeamId')) {
      let team = Teams.findOne()
      if (!team) {
        Router.go('teams.create')
        return;
      }
      else Session.set('currentTeamId', team._id)
    }
  })

  Meteor.subscribe('flows.all', {
  }, {
    fields: {
      title: true,
      descriptiom: true,
      status: true,
      trigger: true
    }
  })
})