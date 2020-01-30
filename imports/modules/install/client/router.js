import { Router } from 'meteor/iron:router'

import i18n from 'meteor/universe:i18n'

const mayGoHome = () => {
  if (Meteor.user()) {
    console.log('3')
    Router.go('dashboard', {
      teamId: '0'
    })
  }
}

Router.route('/install/previous', function () {
  mayGoHome()
  this.render('install.pre')
}, {
  subscriptions: function () {
    return []
  },
  name: 'install.pre',
  title: i18n.__('install.pre')
})

Router.route('/install', function () {
  mayGoHome()
  this.render('install.index')
}, {
  subscriptions: function () {
    return []
  },
  name: 'install.index',
  title: i18n.__('install.title')
})

Router.route('/install/finished', function () {
  mayGoHome()
  this.render('install.finished')
}, {
  subscriptions: function () {
    return []
  },
  name: 'install.finished',
  title: i18n.__('install.finished')
})