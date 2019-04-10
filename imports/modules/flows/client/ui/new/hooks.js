import { AutoForm } from 'meteor/aldeed:autoform'
import { Router } from 'meteor/iron:router'

AutoForm.addHooks(['insertFlowForm'], {
  after: {
    insert: (error, result) => {
      Router.go('flows.one', result)
    }
  },
  before: {
    insert: function (insertDoc) {
      console.log(insertDoc)
      this.done()
    }
  }
})