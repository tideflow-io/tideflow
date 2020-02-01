import { Template } from 'meteor/templating'
import { Teams } from '/imports/modules/teams/both/collection.js'

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

Template.teamsManageMembersUser.helpers({
  user: function() {
    console.log(this)
  }
})