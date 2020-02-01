import { Router } from 'meteor/iron:router'

import i18n from 'meteor/universe:i18n'

Router.route('/teams/new', function () {
  this.render('teamsCreate')
}, {
  subscriptions: function () {
    return [
    ]
  },
  name: 'teams.create',
  title: i18n.__('teams.create.title'),
  parent: 'home'
})

Router.route('/:teamId/settings', function () {
  this.render('teamsManage')
}, {
  subscriptions: function () {
    return [
    ]
  },
  name: 'teams.one.manage',
  title: i18n.__('teams.one.manage.title'),
  parent: 'home'
})

Router.route('/:teamId/members', function () {
  this.render('teamsManageMembers')
}, {
  subscriptions: function () {
    return [
    ]
  },
  name: 'teams.one.members',
  title: i18n.__('teams.one.manage.title'),
  parent: 'home'
})