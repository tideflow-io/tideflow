import { Meteor } from 'meteor/meteor'
import { Router } from 'meteor/iron:router'

import { Flows } from '/imports/modules/flows/both/collection.js'
import { Channels } from '/imports/modules/channels/both/collection.js'
import { Executions } from '/imports/modules/executions/both/collection.js'
import { ExecutionsLogs } from '/imports/modules/executionslogs/both/collection.js'

import i18n from 'meteor/universe:i18n'

import './ui/_common'

import './ui/index'
import './ui/one'
import './ui/executions'
import './ui/executionslogs'
import './ui/new'
import './ui/edit'

Router.route('/flows', function () {
  this.render('flows.index')
}, {
  subscriptions: function () {
    return [
      
    ]
  },
  data: function() {
    if (this.ready) {
      return {
        flows: Flows.find({})
      }
    } 
  },
  name: 'flows.index',
  parent: 'home',
  title: i18n.__('flows.breadcrumb.title.index')
})

Router.route('/flows/new', function () {
  Object.keys(Session.keys).map(sk => {
    if (sk.indexOf('fe-') === 0) {
      delete Session.keys[sk]
    }
  })
  this.render('flows.new')
}, {
  subscriptions: function () {
    return [
      Meteor.subscribe('channels.all', {})
    ]
  },
  data: function() {
    if (this.ready) {
      return {
        channels: Channels.find({})
      }
    } 
  },
  name: 'flows.new',
  parent: 'flows.index',
  title: i18n.__('flows.breadcrumb.title.new')
})

Router.route('/flows/:_id', function () {
  this.render('flows.one')
}, {
  subscriptions: function () {
    return [
      Meteor.subscribe('flows.single', {
        _id: this.params._id
      }),
      Meteor.subscribe('executions.all', {
        flow: this.params._id
      }, {
        fields: {
          _id: true, status: true, createdAt: true, updatedAt: true
        },
        sort: {
          createdAt: -1
        },
        limit: 5
      })
    ]
  },
  data: function() {
    if (this.ready) {
      return {
        flow: Flows.findOne({
          _id: this.params._id
        }),
        executions: Executions.find({
          // flow: this.params._id
        }, {
          sort: {
            createdAt: -1
          }
        })
      }
    } 
  },
  name: 'flows.one',
  parent: 'flows.index',
  title: function() {
    try {
      return this.data().flow.title
    } catch (ex) {}
  }
})

Router.route('/flows/:_id/executions', function () {
  this.render('flowsOneExecutions')
}, {
  subscriptions: function () {
    return [
      Meteor.subscribe('flows.single', {
        _id: this.params._id
      }),
      Meteor.subscribe('executions.all', {
        flow: this.params._id
      }, {
        fields: {
          _id: true, status: true, createdAt: true, updatedAt: true
        },
        sort: {
          createdAt: -1
        }
      })
    ]
  },
  data: function() {
    if (this.ready) {
      return {
        executions: Executions.find({
          // flow: this.params._id
        }),
        flow: Flows.findOne({
          _id: this.params._id
        })
      }
    } 
  },
  name: 'flowsOneExecutions',
  parent: 'flows.one',
  title: i18n.__('flows.breadcrumb.title.executions')
})

Router.route('/flows/:_id/executions/:executionId', function () {
  this.render('flowsOneExecutionsOneDetails')
}, {
  subscriptions: function () {
    return [
      Meteor.subscribe('flows.single', {
        _id: this.params._id
      }),
      Meteor.subscribe('executions.single', {
        _id: this.params.executionId
      }),
      Meteor.subscribe('executionsLogs.all', {
        execution: this.params.executionId
      }, {
        sort: {
          createdAt: 1
        }
      })
    ]
  },
  data: function() {
    if (this.ready) {
      return {
        flow: Flows.findOne({
          _id: this.params._id
        }),
        execution: Executions.findOne({
          _id: this.params.executionId
        }),
        executionsLogs: ExecutionsLogs.find({
          //execution: this.params.executionId
        })
      }
    } 
  },
  name: 'flows.one.executionDetails',
  parent: 'flowsOneExecutions',
  title: function() {
    try {
      return this.data().execution._id.substr(0, 3)
    } catch (ex) {}
  }
})

Router.route('/flows/:_id/edit', function () {
  Object.keys(Session.keys).map(sk => {
    if (sk.indexOf('fe-') === 0) {
      delete Session.keys[sk]
    }
  })
  this.render('flows.one.edit')
}, {
  subscriptions: function () {
    return [
      Meteor.subscribe('channels.all', {})
    ]
  },
  data: function() {
    if (this.ready) {
      return {
        flow: Flows.findOne({
          _id: this.params._id
        }),
        channels: Channels.find({})
      }
    }
  },
  name: 'flows.one.edit',
  parent: 'flows.one',
  title: i18n.__('flows.breadcrumb.title.edit')
})