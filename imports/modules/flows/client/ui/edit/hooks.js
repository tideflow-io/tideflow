import { AutoForm } from "meteor/aldeed:autoform"
import { Router } from 'meteor/iron:router'

AutoForm.addHooks(['updateFlowForm'], {
  after: {
    method: (error, result) => {
      
    }
  }
})