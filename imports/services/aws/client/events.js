import { Template } from 'meteor/templating'

Template.servicesAwsIotShadowUpdate.events({
  'click .load-example': (event, template) => {
    event.preventDefault()
    $(`textarea[name="steps.${template.data.index}.config.shadow"]`).val(`{
  "state": {
    "desired": {
      "display_text": "Hello {{tasks.trigger.result.data.name}}!"
    }
  }
}`)
  }
})

Template.servicesAwsLambdaInvokeUpdate.events({
  'click .load-example': (event, template) => {
    event.preventDefault()
    $(`textarea[name="steps.${template.data.index}.config.data"]`).val(`{
  "key1": "{{tasks.trigger.result.data.value1}}",
  "key2": "value2",
  "key3": "value3"
}`)
  }
})
