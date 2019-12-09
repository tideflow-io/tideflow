import { Template } from 'meteor/templating'
import { Session } from 'meteor/session'

Template['files.templates'].onCreated(function() {
  Session.set('fileTemplatesCategoryFilter', null)
})

Template['files.templates'].events({
  'click .clear-filter': (event, template) => {
    Session.set('fileTemplatesCategoryFilter', null)
  }
})

Template.filesTemplatesCategoryFilter.events({
  'click a': (event, template) => {
    const { _id } = template.data
    Session.set('fileTemplatesCategoryFilter', _id)
  }
})
