import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Router } from 'meteor/iron:router'
import { sAlert } from 'meteor/juliancwirko:s-alert'

import i18n from 'meteor/universe:i18n'

Template.teamsCreate.events({
  'submit #team-create': (event) => {
    event.preventDefault()
    const name = event.target.name.value
    
    if (name.length < 3) {
      sAlert.error(i18n.__('teams.create.form.errors.name-too-short'))
      return
    }

    Meteor.call('teams.create', {
      name
    }, (error, teamId) => {
      if (error) {
        sAlert.error(i18n.__(error.error))
        return
      }
      Router.go('dashboard', { teamId })
    })
  }
})
