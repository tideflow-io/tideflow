import { AutoForm } from 'meteor/aldeed:autoform'
import { analyze, buildFlow, isCircular } from '/imports/modules/flows/both/flow'

AutoForm.addHooks(['updateFlowForm'], {
  before: {
    method: function (doc) {
      let flow = {}
      try {
        flow = buildFlow(doc)
        if (!flow.steps) flow.steps = []
        if (!flow.steps.length) throw new Meteor.Error('no-steps')
      }
      catch (ex) {
        sAlert.error(i18n.__(ex.message))
        return false
      }
      let analysis = analyze(flow, null, true)
      return analysis.isErrored ? false : flow
    }
  },
  after: {
    method: (error, result) => {
      if (error) {
        return;
      }
      jsPlumb.ready(function() {
        jsPlumbUtil.logEnabled = false
        $('#flow-editor .card').remove()
        jsPlumb.deleteEveryConnection()
      })

      // Router.go('flows.one', result)
      location.reload();
    }
  }
})
