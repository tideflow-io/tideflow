import { Template } from 'meteor/templating'
import { Meteor } from 'meteor/meteor'

import { getSetting } from '../../../modules/management/both/settings'
import { Teams } from '/imports/modules/teams/both/collection'
import { checkRole } from '/imports/helpers/both/roles'
import { isAdmin } from '../../../modules/_common/both/teams'
import { siteName } from '/imports/helpers/both/tideflow'

Template.appHeader.helpers({
  siteName: siteName(),
  allowTeamCreation: () => {
    return getSetting('teamsCreation', 'creationPermissions') === 'public' ||
      checkRole(Meteor.userId(), 'super-admin')
  },
  allowTeamSettings: () => {
    return isAdmin(Meteor.userId(), Session.get('lastTeamId'))
  },
  teams: () => {
    return Teams.find({
      'members.user': Meteor.userId()
    })
  }
})

Template.appHeaderTeam.helpers({
  activeTeam: (template) => {
    return template.data._id === Session.get('lastTeamId')
  }
})
