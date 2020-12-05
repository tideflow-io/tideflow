import { AutoForm } from 'meteor/aldeed:autoform'
import { buildFlow, isCircular } from '/imports/modules/flows/both/flow'

AutoForm.addHooks(['updateFlowForm'], {
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
