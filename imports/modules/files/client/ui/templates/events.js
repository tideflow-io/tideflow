import { Router } from 'meteor/iron:router'
import { Template } from 'meteor/templating'
import { Session } from 'meteor/session'

Template['files.templates'].onCreated(function() {
  Session.set('fileTemplatesCategoryFilter', null)
})

Template['files.templates'].events({
  'click .clear-filter': () => {
    Session.set('fileTemplatesCategoryFilter', null)
  },
  'click .new-file-empty': () => {
    Router.go('files.new', {})
  }
})

Template.filesTemplatesCategoryFilter.events({
  'click a': (_event, template) => {
    const { _id } = template.data
    Session.set('fileTemplatesCategoryFilter', _id)
  }
})

Template.filesTemplatesCard.events({
  'click *': (_event, template) => {
    Router.go('files.new', {}, { hash: template.data._id })
  }
})
