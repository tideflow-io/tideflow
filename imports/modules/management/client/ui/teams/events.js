import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { sAlert } from 'meteor/juliancwirko:s-alert'

import i18n from 'meteor/universe:i18n'

Template['management.teams'].events({
  'submit #teams-update': (event, template) => {
    event.preventDefault()
    const creationPermissions = event.target.teamsCreation.value

    Meteor.call('site-permissions-teams', {
      creationPermissions,
    }, (error, result) => {
      if (error) {
        sAlert.error(i18n.__('management.teams.submit.error'))
      }
      else {
        sAlert.success(i18n.__('management.teams.submit.ok'))
      }
    })
  }
})