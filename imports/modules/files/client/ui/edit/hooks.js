import { AutoForm } from 'meteor/aldeed:autoform'

AutoForm.addHooks(['updateFileForm'], {
  onSuccess: function (formType, result) {
    location.reload()
  }
})