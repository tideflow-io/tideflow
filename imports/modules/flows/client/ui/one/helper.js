import { Template } from 'meteor/templating'

Template['flows.one'].helpers({
  'executions': function () {
    return Template.instance().executions ?
      Template.instance().executions.get() :
      []
  },
  'executionsLoaded': function () {
    return Template.instance().executionsLoaded.get()
  }
})