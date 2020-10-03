import { Router } from 'meteor/iron:router'
import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'

import { ExecutionsStats } from '/imports/modules/executions/client/collection'

Template.dashboard.onCreated(function() {
  let self = this
  this.executionsTime = new ReactiveVar('last24Hours')
  this.autorun(function () {
    self.subscribe('dashboard.executionsStats', {
      time: self.executionsTime.get(),
      team: Router.current().params.teamId
    }, {
      limit: 0
    })
  })
})

Template.dashboard.helpers({
  'executions': function () {
    return ExecutionsStats.find().fetch()
  },
  'executionsTime': function() {
    return Template.instance().executionsTime.get()
  }
})

Template.dashboard.events({
  'click #execution-filter-month': (event, template) => {
    template.executionsTime.set('lastMonth')
  },
  'click #execution-filter-week': (event, template) => {
    template.executionsTime.set('lastWeek')
  },
  'click #execution-filter-day': (event, template) => {
    template.executionsTime.set('last24Hours')
  }
})

Template.darhboardExecutionFlow.events({
  'click .card': (event, template) => {
    event.stopPropagation()
    Router.go('flows.one', {
      _id: template.data._id,
      teamId: Router.current().params.teamId
    })
  }
})