import { Session } from 'meteor/session'
import i18n from 'meteor/universe:i18n'
import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'

import { servicesAvailable } from '/imports/services/_root/client'

import { Services } from '/imports/modules/services/both/collection.js'

import './ui/index'
import './ui/new'
import './ui/newType'
import './ui/edit'

Router.route('/:teamId/services', function () {
  this.render('services.index')
}, {
  subscriptions: function () {
    return [
      Meteor.subscribe('services.all', {
        team: this.params.teamId
      }, {
        sort: {
          createdAt: -1
        }
      })
    ]
  },
  data: function() {
    if (this.ready) {
      return {
        services: Services.find({}, {
          sort: {
            createdAt: -1
          }
        })
      }
    } 
  },
  name: 'services.index',
  title: 'Services',
  parent: 'home'
})

Router.route('/:teamId/services/new', function () {
  this.render('services.new')
}, {
  name: 'services.new',
  title: 'New',
  parent: 'services.index'
})

Router.route('/:teamId/services/new/:type', function () {
  window.editorViewDetailsHooks = []
  this.render('services.new.type')
}, {
  data: function() {
    if (this.ready) {
      return {
        type: this.params.type
      }
    } 
  },
  name: 'services.new.type',
  title: function() {
    try {
      return i18n.__(
        servicesAvailable.find(sa => sa.name === this.params.type).humanName
      )
    } catch (ex) { return null }
  },
  parent: 'services.new'
})

Router.route('/:teamId/services/:type/:_id/edit', function () {
  window.editorViewDetailsHooks = []
  this.render('services.one.edit')
}, {
  waitOn: function () {
    return [
      Meteor.subscribe('services.single', {
        _id: this.params._id,
        team: this.params.teamId
      })
    ]
  },
  data: function() {
    if (this.ready) {
      return {
        type: this.params.type,
        service: Services.findOne({
          _id: this.params._id
        })
      }
    } 
  },
  name: 'services.one.edit',
  title: function() {
    try {
      return this.data().service.title
    } catch (ex) { return }
  },
  parent: 'services.index'
})