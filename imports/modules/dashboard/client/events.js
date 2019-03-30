import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'

Template.dashboard.onCreated(function() {
  let self = this

  this.executionsTime = new ReactiveVar('last24Hours')
  this.executions = new ReactiveVar(null)
  this.executionsLoaded = new ReactiveVar(false)

  this.autorun(function () {
    self.executions.set([])
    Meteor.call('dashboard.executions', {
      time: self.executionsTime.get(),
    }, {
      limit: 0
    }, (error, result) => {
      console.log('loaded')
      if (!error) {
        self.executions.set(result)
      }
      self.executionsLoaded.set(true)
    })
  })

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