import { Template } from 'meteor/templating'
import { Channels } from '/imports/modules/channels/both/collection.js'

const editorDefaults = {
  dataType: 'json',
  disabledAttrs: ['access'],
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
  let channel = Channels.findOne({ _id })
  this.webformEditor = $('#webform-editor').formBuilder(
    Object.assign({}, editorDefaults, {
      formData: (channel.details||{}).form || []
    })
  )
  window.editorViewDetailsHooks = {
    form: () => this.webformEditor.actions.getData()
  }
})