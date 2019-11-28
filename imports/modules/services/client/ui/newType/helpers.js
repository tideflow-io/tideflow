import { Template } from 'meteor/templating'

import { servicesAvailable } from '/imports/services/_root/client'

import { Services } from '/imports/modules/services/both/collection.js'

Template['services.new.type'].helpers({
  service: function() {
    return servicesAvailable.find(s => s.name === this.type)
  },
  serviceCreationForm: function() {
    return servicesAvailable.find(s => s.name === this.type).templates.createForm
  },
  serviceCreationFormAfter: function() {
    try {
      return servicesAvailable.find(s => s.name === this.type).templates.createFormAfter
    }
    catch (ex) {
      return null
    }
  },
  serviceCreationFormPre: function() {
    try {
      return servicesAvailable.find(s => s.name === this.type).templates.createFormPre
    } catch (ex) { return null }
  },

  Services
})