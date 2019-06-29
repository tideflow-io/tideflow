import { Template } from 'meteor/templating'

Template.dashboard.helpers({
  'executions': function () {
    if (!Template.instance().executions) return
    const executions = Template.instance().executions.get()
    let r = _.chain(executions)
      .groupBy('flow')
      .map((list, flow) => ({ list, flow }))
      .value()
    return r
  },
  'executionsLoaded': function () {
    return Template.instance().executionsLoaded.get()
  },
  'executionsFilter': function () {
    return Template.instance().executionsTime.get()
  }
})