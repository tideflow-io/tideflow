import { Flows } from '/imports/modules/flows/both/collection'
import { realPosition } from '/imports/modules/flows/both/flow'

Template.servicesConditionIfConfig.onCreated(function created() {
  this.typeOfCondition = new ReactiveVar('string');
});

Template.servicesConditionIfConfig.onRendered(function created() {
  let self = this
  try {
    let flow = Flows.findOne({_id:Router.current().params._id})
    let step = flow.steps[self.data.index]
    self.typeOfCondition.set(step.config.type)
    $(`input[data-schema-key="steps.${self.data.index}.config.type"]`).val(step.config.type)
  } catch (ex) {
    $(`input[data-schema-key="steps.${self.data.index}.config.type"]`).val('string')
  }
})

Template.servicesConditionIfConfig.events({
  'change .condition-type input[type="radio"]': (event, template) => {
    const type = event.target.value
    const index = template.data.index
    const fieldName = `input[data-schema-key="steps.${index}.config.type"]`
    template.typeOfCondition.set(type)
    $(fieldName).val(type)
  }
})

Template.servicesConditionIfConfig.helpers({

  /**
   * Show the list of steps that connect to this one
   */
  precedingTasks: function () {
    try {
      let result = []

      // Load in-editor flow
      let flow = Session.get('fe-flow')
      // Override with the one on the databse
      if (flow && flow._id) flow = Flows.findOne({_id:flow._id})
      // If still can't find a flow, stop here
      if (!flow || !flow.steps) return result;

      // Get the condition's real position
      let index = realPosition(this.index)
      // Get the step's current configuration
      let step = flow.steps[index]
      let preselected = step && step.config ? step.config.step : null

      // Get the list of preceding tasks
      let calledFroms = Session.get('fe-flow-analysis-calledFrom')
      if (!flow || !calledFroms) return []
      let froms = calledFroms[index];

      // Loop preceding tasks and build expected format. Including selected opt.
      (froms || []).map(f => {
        if (f === 'trigger') result.push({id:'trigger', label: 'Trigger', selected: preselected === 'trigger'})
        else {
          let spotted = flow.steps[f]
          result.push({id:spotted.id, label: spotted.id, selected: preselected === spotted.id})
        }
      })

      return result
    }
    catch (ex) {
      console.error(ex)
      return []
    }
  },
  subTemplate: function() {
    const type = Template.instance().typeOfCondition.get()
    if (type !== '') return `servicesConditionIfConfig-${type}`
    if (!this.steps) return `servicesConditionIfConfig-string`
    if (!this.steps[this.index]) return `servicesConditionIfConfig-string`
    let r = this.steps[this.index].config.type
    return `servicesConditionIfConfig-${r}`
  }, 
  subTemplateTypeChecked: function(compare) {
    const type = Template.instance().typeOfCondition.get()
    if (type !== '') return type === compare ? 'checked' : ''
    if (!this.steps) return 'string' === compare ? 'checked' : ''
    if (!this.steps[this.index]) return 'string' === compare ? 'checked' : ''
    let r = this.steps[this.index].config.type
    return r === compare ? 'checked' : ''
  }
})
