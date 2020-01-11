import { Template } from 'meteor/templating'

Template.dashboard.helpers({
  'executions': function () {
    return Template.instance().executions ?
      Template.instance().executions.get() :
      []
  },
  'executionsLoaded': function () {
    return Template.instance().executionsLoaded.get()
  },
  'executionsTime': function() {
    return Template.instance().executionsTime.get()
  }
})