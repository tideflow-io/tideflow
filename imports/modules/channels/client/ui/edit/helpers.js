import { Template } from 'meteor/templating'

import { Channels } from "/imports/modules/channels/both/collection.js"

import { servicesAvailable } from '/imports/services/_root/client'

Template['channels.one.edit'].helpers({
  Channels: function () {
    return Channels
  },
  channelUpdateForm: function() {
    return servicesAvailable.find(s => s.name === this.type).templates.updateForm
  },
  channelUpdateFormPre: function() {
    try {
      return servicesAvailable.find(s => s.name === this.type).templates.updateFormPre
    }
    catch (ex) {
      return null
    }
  },
  channelService: function () {
    if (!this.channel) return
    return servicesAvailable.find(sa => sa.name === this.channel.type)
  }
})