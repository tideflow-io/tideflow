import { Flows } from '/imports/modules/flows/both/collection'

Template.servicesConditionIfConfig.onCreated(function created() {
  let self = this
  self.typeOfCondition = new ReactiveVar('string');

  Tracker.autorun(function () {
    try {
      let flow = Flows.findOne({_id:Router.current().params._id})
      let step = flow.steps[self.data.index]
      self.typeOfCondition.set(step.config.type)
    } catch (ex) {}
  })
});

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
