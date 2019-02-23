import { Template } from 'meteor/templating'

Template.registerHelper('flowEnabled', function() {
  return this ? this.status === 'enabled' : null
})