import { Template } from 'meteor/templating'

import { servicesAvailable } from '/imports/services/_root/client'

import { Channels } from "/imports/modules/channels/both/collection.js"

Template['channels.new.type'].helpers({
  channel: function() {
    return servicesAvailable.find(s => s.name === this.type)
  },
  channelCreationForm: function() {
    return servicesAvailable.find(s => s.name === this.type).templates.createForm
  },
  channelCreationFormAfter: function() {
    try {
      return servicesAvailable.find(s => s.name === this.type).templates.createFormAfter
    }
    catch (ex) {
      return null
    }
  },
  channelCreationFormPre: function() {
    try {
      return servicesAvailable.find(s => s.name === this.type).templates.createFormPre
    }
    catch (ex) {
      return null
    }
  },
  Channels
})