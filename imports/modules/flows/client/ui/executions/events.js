import { Meteor } from 'meteor/meteor'
import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating'
import { moment } from 'meteor/momentjs:moment'

Template.flowsOneExecutions.onCreated(function() {
  let self = this

  this.start = new ReactiveVar()
  this.end = new ReactiveVar()
  this.executionsStats = new ReactiveVar({})
  this.executionsStatsLoaded = new ReactiveVar(false)
})

Template.flowsOneExecutions.onRendered(function() {
  let self = this

  this.autorun(function () {
    if (!self.start.get() || typeof self.start.get().toDate !== 'function') return
    
    Meteor.call('flows.one.executions', {
      flow: Router.current().params._id,
      createdAt: {
        $gt: self.start.get().toDate()
      },
      updatedAt: {
        $lt: self.end.get().toDate()
      }
    }, (error, result) => {
      if (!error) {
        self.executionsStats.set(result.length ? result[0] : {result:[]})
      }
      self.executionsStatsLoaded.set(true)
    })

    Meteor.subscribe('executions.all', {
      flow: Router.current().params._id,
      createdAt: {
        $gt: self.start.get().toDate()
      },
      updatedAt: {
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
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days').endOf('day')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment()],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    }
  }, cb)
  
  cb(start, end)
})

Template.flowsOneExecutions.events({
  'click #reportrange': () => {
    
  }
})
