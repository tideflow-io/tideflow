import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'

import { Files } from '/imports/modules/files/both/collection.js'

import './ui/index'
import './ui/new'
import './ui/edit'

Router.route('/files', function () {
  this.render('files.index')
}, {
  subscriptions: function () {
    return [
      Meteor.subscribe('files.all', {}, {
        sort: {
          createdAt: -1
        }
      })
    ]
  },
  data: function() {
    if (this.ready) {
      return {
        files: Files.find({}, {
          sort: {
            createdAt: -1
          }
        })
      }
    } 
  },
  name: 'files.index',
  title: 'Files',
  parent: 'home'
})

Router.route('/files/new', function () {
  this.render('files.new')
}, {
  name: 'files.new',
  title: 'New',
  parent: 'files.index'
})

Router.route('/files/:_id/edit', function () {
  this.render('files.one.edit')
}, {
  waitOn: function () {
    return [
      Meteor.subscribe('files.all', {})
    ]
  },
  data: function() {
    if (this.ready) {
      return {
        file: Files.findOne({
          _id: this.params._id
        })
      }
    } 
  },
  name: 'files.one.edit',
  title: function() {
    try {
      return this.data().name
    } catch (ex) {

    }
  },
  parent: 'files.index'
})