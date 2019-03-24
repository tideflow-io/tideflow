import { Template } from 'meteor/templating'

Template.dashboard.helpers({
  'executions' () {
    console.log(Template.dashboard)
    return Template.dashboard.executions.get()
  }
})