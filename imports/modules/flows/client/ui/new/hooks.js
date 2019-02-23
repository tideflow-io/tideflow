import { AutoForm } from "meteor/aldeed:autoform"
import { Router } from 'meteor/iron:router'

// ***************************************************************
// AUTOFORM HOOKS
// ***************************************************************

// Shows a simple message and re-routes if successful
AutoForm.addHooks(['insertFlowForm'], {
  after: {
    method: (error, result) => {
      Router.go('flows.one', result)
    }
  }
})