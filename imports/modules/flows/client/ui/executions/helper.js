import { Template } from 'meteor/templating'
import { Executions } from '/imports/modules/executions/both/collection.js'

Template.flowsOneExecutions.helpers({
  executions: Executions.find({
    // flow: this.params._id
  }, {
    sort: {
      createdAt: -1
    }
  }),
  executionsStats: function () {
    return Template.instance().executionsStats ?
      Template.instance().executionsStats.get() :
      []
  },
  executionsStatsLoaded: function () {
    return Template.instance().executionsStatsLoaded.get()
  }
})