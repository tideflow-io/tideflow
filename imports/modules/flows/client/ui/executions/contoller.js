import { Template } from 'meteor/templating'
import { Router } from 'meteor/iron:router'
import { Executions } from '/imports/modules/executions/both/collection'
import { ReactiveVar } from 'meteor/reactive-var'
import { moment } from 'meteor/momentjs:moment'

import { ExecutionsStats } from '/imports/modules/executions/client/collection'

Template.flowsOneExecutions.helpers({
  executions: Executions.find({
    // flow: this.params._id
  }, {
    sort: {
      createdAt: -1
    }
  }),
  executionsStats: function () {
    let e = ExecutionsStats.find().fetch()
    return e && e[0] ? e[0] : {}
  },
})

Template.flowsOneExecutions.onCreated(function() {
  this.start = new ReactiveVar()
  this.end = new ReactiveVar()
  this.executionsStats = new ReactiveVar({})
})

Template.flowsOneExecutions.onRendered(function() {
  let self = this

  this.autorun(function () {
    if (!self.start.get() || typeof self.start.get().toDate !== 'function') return
    
    self.subscribe('flows.one.executionsStats', {
      flow: Router.current().params._id,
      team: Router.current().params.teamId,
      createdAt: {
        $gt: self.start.get().toDate(),
        $lt: self.end.get().toDate()
      }
    })

    self.subscribe('executions.all', {
      flow: Router.current().params._id,
      team: Router.current().params.teamId,
      createdAt: {
        $gt: self.start.get().toDate(),
        $lt: self.end.get().toDate()
      },
    }, {
      fields: {
        _id: true, status: true, createdAt: true, updatedAt: true
      },
      sort: {
        createdAt: -1
      }
    })
  })

  var start = moment().subtract(29, 'days')
  var end = moment()

  function cb(start, end) {
    $('#reportrange span').html(start.format('MMMM D, YYYY h:mm:ss A z') + '&nbsp;&nbsp;-&nbsp;&nbsp;' + end.format('MMMM D, YYYY h:mm:ss A z'))
    self.start.set(start)
    self.end.set(end)
  }
  
  $('#reportrange').daterangepicker({
    timePicker: true,
    startDate: start,
    endDate: end,
    ranges: {
      'Today': [moment().startOf('day'), moment().endOf('day')],
      'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
      'Last 7 Days': [moment().subtract(7, 'days'), moment().endOf('day')],
      'Last 30 Days': [moment().subtract(30, 'days'), moment().endOf('day')],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    }
  }, cb)
  
  cb(start, end)
})

Template.flowsOneExecutions.events({
  'click #reportrange': () => {
    
  }
})
