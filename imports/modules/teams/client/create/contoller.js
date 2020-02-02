import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Session } from 'meteor/session'
import { Accounts } from 'meteor/accounts-base'
import { Router } from 'meteor/iron:router'
import { sAlert } from 'meteor/juliancwirko:s-alert'

import i18n from 'meteor/universe:i18n'

Template.teamsCreate.events({
  'submit #team-create': (event) => {
    event.preventDefault()
    const name = event.target.name.value
    
    if (name.length < 6) {
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
