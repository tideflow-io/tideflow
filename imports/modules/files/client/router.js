import { Session } from 'meteor/session'
import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'

import { Files } from '/imports/modules/files/both/collection.js'
import { FilesTemplatesCategories } from '/imports/modules/filesTemplatesCategories/both/collection'

import './ui/index'
import './ui/new'
import './ui/templates'
import './ui/edit'

Router.route('/files', function () {
  this.render('files.index')
}, {
  subscriptions: function () {
    return [
      Meteor.subscribe('files.all', {
        team: Session.get('currentTeamId')
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

Router.route('/files/templates', function () {
  this.render('files.templates')
}, {
  subscriptions: function () {
    return [
      Meteor.subscribe('filesTemplatesCategories.all', {}, {
        sort: {
          createdAt: -1
        }
      }),
      Meteor.subscribe('filesTemplates.all', {}, {
        sort: {
          createdAt: -1
        }
      })
    ]
  },
  data: function () {
    return {
      categories: FilesTemplatesCategories.find(
        {},
        { sort: { priority: -1 } }
      )
    }
  },
  name: 'files.templates',
  title: 'Templates',
  parent: 'files.index'
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
      Meteor.subscribe('files.single', {
        _id: this.params._id,
        team: Session.get('currentTeamId')
      })
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
      return this.data().file.name
    } catch (ex) { return }
  },
  parent: 'files.index'
})
