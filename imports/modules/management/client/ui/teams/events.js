import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { sAlert } from 'meteor/juliancwirko:s-alert'

import i18n from 'meteor/universe:i18n'

import { Teams } from '/imports/modules/teams/both/collection'

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

Template['managementTeamsItem'].events({
  'click .remove': (event, template) => {
    event.preventDefault()
    event.stopPropagation()
    event.preventDefault()

    // Do not allow to remove system's default teams
    if (template.data.systemDefault) {
      sAlert.error(i18n.__('management.teams.delete.isSystemDefault'))
      return
    }

    swal({
      title: i18n.__('management.teams.delete.title'),
      text: i18n.__('management.teams.delete.text'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      animation: false
    })
      .then(accepted => {
        if (accepted) {
          Meteor.call('teams.delete', {
            _id: template.data._id
          }, (error) => {
            if (error) {
              sAlert.error(i18n.__('management.teams.delete.error'))
              return
            }
            sAlert.success(i18n.__('management.teams.delete.success'))
          })
        }
      })
  },
  'click .system-default': (event, template) => {
    event.preventDefault()
    const _id = template.data._id
    const isSystemDefault = template.data.systemDefault

    // User want to set group as non-default
    if (isSystemDefault) {
      // Check if there are other system default teams
      let otherDefaultTeams = Teams.findOne({
        systemDefault: true,
        _id: { $ne: _id }
      })

      // There are not other default groups
      if (!otherDefaultTeams) {
        sAlert.error(i18n.__('management.teams.systemDefault.disable.no-others'))
        return;
      }

      Meteor.call('teams.toggleDefault', _id, false)
    }

    // User want to set group as default
    else {
      Meteor.call('teams.toggleDefault', _id, true)

    }
  }
})