import { AutoForm } from 'meteor/aldeed:autoform'
import { Router } from 'meteor/iron:router'
import { buildFlow, isCircular } from '/imports/modules/flows/both/flow'

AutoForm.addHooks(['insertFlowForm'], {
  before: {
    method: function (doc) {
      let flow = {}
      try {
        flow = buildFlow(doc)
      }
      catch (ex) {
        sAlert.error(i18n.__(ex.message))
        return false
      }
      let isC = isCircular(flow)
      return isC ? false : flow
    }
  },
  after: {
    method: (error, result) => {
      if (error && error.error === 'trigger-already-used') {
        return sAlert.error(i18n.__('flows.errors.identicalTrigger'))
      }
      
      jsPlumb.ready(function() {
        jsPlumbUtil.logEnabled = false
        $('#flow-editor .card').remove()
        jsPlumb.deleteEveryConnection()
      })
      
      Router.go('flows.one', {
        _id: result._id,
        teamId: result.team
      })
    }
  }
})
