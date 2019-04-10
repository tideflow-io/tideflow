import { AutoForm } from 'meteor/aldeed:autoform'
import { Router } from 'meteor/iron:router'

AutoForm.addHooks(['updateFlowForm'], {
  before: {
    method: function (doc) {
      return doc
    }
  },
  after: {
    method: (error, result) => {
      Router.go('flows.one', result)
    }
  }
})
