import { Template } from 'meteor/templating'
import { Session } from 'meteor/session'

Template['files.templates'].onCreated(function() {
  Session.set('fileTemplatesCategoryFilter', null)
})

Template['files.templates'].events({
  'click .clear-filter': (event, template) => {
    Session.set('fileTemplatesCategoryFilter', null)
  },
  'click .new-file-empty': (event, template) => {
    Router.go('files.new', {})
  }
})

Template.filesTemplatesCategoryFilter.events({
  'click a': (event, template) => {
    const { _id } = template.data
    Session.set('fileTemplatesCategoryFilter', _id)
  }
})

Template.filesTemplatesCard.events({
  'click *': (event, template) => {
    Router.go('files.new', {}, { hash: template.data._id })
  }
})
