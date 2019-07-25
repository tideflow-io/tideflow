import { Template } from 'meteor/templating'

const uuidv4 = require('uuid/v4')

Template.triggerEditorEndpointEventNewContent.onRendered(function() {
  const trigger = this.data.flow.trigger
  
  if (!(trigger.config || {}).endpoint) {
    $('[name="trigger.config.endpoint"]').val(uuidv4())
  }
})