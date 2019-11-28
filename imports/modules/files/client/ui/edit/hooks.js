import { Router } from 'meteor/iron:router'
import { AutoForm } from 'meteor/aldeed:autoform'

AutoForm.addHooks(['updateFileForm'], {
  onSuccess: function (formType, result) {
    Router.go('files.index')
  }
})