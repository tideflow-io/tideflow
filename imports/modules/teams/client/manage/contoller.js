import { Template } from 'meteor/templating'
import { Teams } from '/imports/modules/teams/both/collection.js'
import { userEmailById } from '../../../../helpers/both/emails'

Template.teamsManage.helpers({
  Teams: function () {
    return Teams
  },
  team: function () {
    return Teams.findOne({_id: Router.current().params.teamId})
  }
})

Template.teamsManageMembers.helpers({
  Teams: function () {
    return Teams
  },
  team: function () {
    return Teams.findOne({_id: Router.current().params.teamId})
  }
})

Template.teamsManageMembers.onRendered(() => {
  $('[data-toggle="tooltip"]').tooltip()
})

Template.teamsManageMembersUser.helpers({
  userEmail: function() {
    return userEmailById(this.user)
  },
  isMember: function() {
    return this.role === 'member'
  },
  isAdmin: function() {
    return this.role === 'admin'
  }
})

Template.teamsManageMembersUser.events({
  'click input[type="checkbox"]': function(event) {
    const user = this.user
    const oldRole = this.role
    const switchRole = this.role !== event.target.value && event.target.checked

    if (user === Meteor.userId()) {
      sAlert.info(i18n.__('teams.members.switch.errors.notmyself'))
      return;
    }

    if (switchRole) {
      let newRole = oldRole === 'member' ? 'admin' : 'member'
      Meteor.call(
        'teamMember.switchRole',
        Router.current().params.teamId,
        this.user,
        newRole, (error, result) => {
          console.log({error, result})
        }
      )
    }
  }
})
