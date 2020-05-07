import { Template } from 'meteor/templating'
import { Services } from '/imports/modules/services/both/collection'

const editorDefaults = {
  dataType: 'json',
  disabledAttrs: ['access', 'style'],
  disableFields: ['file', 'autocomplete'],
  disabledActionButtons: ['data', 'clear', 'save']
}

Template.servicesWebformCreateFormAfter.onRendered(function() {
  this.webformEditor = $('#webform-editor').formBuilder(editorDefaults)
  window.editorViewDetailsHooks = {
    form: () => this.webformEditor.actions.getData()
  }
})

Template.servicesWebformUpdateFormAfter.onRendered(function() {
  let _id = Router.current().params._id
  let service = Services.findOne({ _id })
  this.webformEditor = $('#webform-editor').formBuilder(
    Object.assign({}, editorDefaults, {
      formData: (service.details||{}).form || []
    })
  )
  window.editorViewDetailsHooks = {
    form: () => this.webformEditor.actions.getData()
  }
})