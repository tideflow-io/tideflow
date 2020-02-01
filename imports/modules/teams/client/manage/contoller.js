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

Template.teamsManageMembers.events({
  'submit #member-invite': (event) => {
    event.preventDefault()
    const email = event.target.emailInvite.value
    Meteor.call(
      'teamMember.add',
      Router.current().params.teamId,
      email, (error, result) => {
        if (error) {
          sAlert.info(i18n.__(error.error))
          return;
        }
        sAlert.success(i18n.__('teams.members.add.success'))

      }
    )
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
  },
  'click .remove': function (event) {
    event.preventDefault()
    swal({
      title: i18n.__('teams.members.delete.title'),
      text: i18n.__('teams.members.delete.text'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      animation: false
    })
      .then(accepted => {
        if (accepted) {
          Meteor.call('teamMember.remove', Router.current().params.teamId, this.user, (error) => {
            if (error) {
              sAlert.error(i18n.__(error.error))
              return
            }
            sAlert.success(i18n.__('teams.members.delete.success'))
          })
        }
      })
  }
})
