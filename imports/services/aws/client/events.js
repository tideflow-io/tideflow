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