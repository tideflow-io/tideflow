import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'

import { Channels } from "/imports/modules/channels/both/collection.js"

import './ui/index'
import './ui/new'
import './ui/newType'
import './ui/edit'

Router.route('/channels', function () {
  this.render('channels.index')
}, {
  subscriptions: function () {
    return [
      Meteor.subscribe('channels.all', {}, {
        sort: {
          createdAt: -1
        }
      })
    ]
  },
  data: function() {
    if (this.ready) {
      return {
        channels: Channels.find({}, {
          sort: {
            createdAt: -1
          }
        })
      }
    } 
  },
  name: 'channels.index',
  title: 'Channels',
  parent: 'home'
})

Router.route('/channels/new', function () {
  this.render('channels.new')
}, {
  name: 'channels.new',
  title: 'New',
  parent: 'channels.index'
})

Router.route('/channels/new/:type', function () {
  this.render('channels.new.type')
}, {
  data: function() {
    if (this.ready) {
      return {
        type: this.params.type
      }
    } 
  },
  name: 'channels.new.type',
  title: function() {
    return 'New'
  },
  parent: 'channels.new'
})

Router.route('/channels/:type/:_id/edit', function () {
  this.render('channels.one.edit')
}, {
  subscriptions: function () {
    return [
      Meteor.subscribe('channels.single', {
        _id: this.params._id
      })
    ]
  },
  data: function() {
    if (this.ready) {
      return {
        type: this.params.type,
        channel: Channels.findOne({
          _id: this.params._id
        })
      }
    } 
  },
  name: 'channels.one.edit',
  title: function() {
    try {
      return this.data().channel.title
    } catch (ex) {}
  },
  parent: 'channels.index'
})