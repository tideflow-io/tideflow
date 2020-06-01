import { Template } from 'meteor/templating'
import { Session } from 'meteor/session'

import { Files } from '/imports/modules/files/both/collection'

Template.servicesSpreadsheetCommonConfig.events({
  'click .remoteFileSelector': event => {
    const agentField = $(event.target).data('agent-field')
    const agentId = $(`[name="${agentField}"]`).val()
    if (!agentId || agentId === '') return
    Session.set('remoteFileSelectorAgent', agentId)
    Session.set('remoteFileSelectorAgent-field', $(event.target).data('field-name'))
  },
  files: function () {
    return Files.find()
  }
})