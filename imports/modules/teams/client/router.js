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