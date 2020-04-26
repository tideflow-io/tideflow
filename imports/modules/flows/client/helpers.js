import { Template } from 'meteor/templating'

Template.registerHelper('flowEnabled', function(flow) {
  return (flow || this) ? (flow || this).status === 'enabled' : null
})