import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'
import { Router } from 'meteor/iron:router'

import { Flows } from '/imports/modules/flows/both/collection'
import { Services } from '/imports/modules/services/both/collection'
import { Executions } from '/imports/modules/executions/both/collection'
import { ExecutionsLogs } from '/imports/modules/executionslogs/both/collection'

import i18n from 'meteor/universe:i18n'

import './ui/_common'

import './ui/index'
import './ui/one'
import './ui/executions'
import './ui/executionslogs'
import './ui/new'
import './ui/edit'

Router.route('/:teamId/flows', function () {
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

Router.route('/:teamId/flows/new', function () {
  Object.keys(Session.keys).map(sk => {
    if (sk.indexOf('fe-') === 0) {
      delete Session.keys[sk]
    }
  })
  this.render('flows.new')
}, {
  subscriptions: function () {
    return [
      Meteor.subscribe('services.all', {
        team: this.params.teamId
      }),
      Meteor.subscribe('files.all', {
        team: this.params.teamId
      })
    ]
  },
  data: function() {
    if (this.ready) {
      return {
        services: Services.find({})
      }
    } 
  },
  name: 'flows.new',
  parent: 'flows.index',
  title: i18n.__('flows.breadcrumb.title.new')
})

Router.route('/:teamId/flows/:_id', function () {
  this.render('flows.one')
}, {
  subscriptions: function () {
    return [
      Meteor.subscribe('flows.single', {
        _id: this.params._id,
        team: Router.current().params.teamId
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
        limit: 10
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
    const data = this.data()
    return data && data.flow ? data.flow.title : null
  }
})

Router.route('/:teamId/flows/:_id/executions', function () {
  this.render('flowsOneExecutions')
}, {
  subscriptions: function () {
    return [
      Meteor.subscribe('flows.single', {
        _id: this.params._id,
        team: Router.current().params.teamId
      })
    ]
  },
  data: function() {
    if (this.ready) {
      return {
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

Router.route('/:teamId/flows/:_id/executions/:executionId', function () {
  this.render('flowsOneExecutionsOneDetails')
}, {
  subscriptions: function () {
    return [
      Meteor.subscribe('flows.single', {
        _id: this.params._id,
        team: Router.current().params.teamId
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

Router.route('/:teamId/flows/:_id/edit', function () {
  // Remove all session variables related to the flows editor
  Object.keys(Session.keys).map(sk => {
    if (sk.indexOf('fe-') === 0) {
      delete Session.keys[sk]
    }
  })
  this.render('flows.one.edit')
}, {
  subscriptions: function () {
    return [
      Meteor.subscribe('services.all', {
        team: this.params.teamId
      }),
      Meteor.subscribe('files.all', {
        team: this.params.teamId
      })
    ]
  },
  data: function() {
    if (this.ready) {
      return {
        flow: Flows.findOne({
          _id: this.params._id
        }),
        services: Services.find({})
      }
    }
  },
  name: 'flows.one.edit',
  parent: 'flows.one',
  title: i18n.__('flows.breadcrumb.title.edit')
})
