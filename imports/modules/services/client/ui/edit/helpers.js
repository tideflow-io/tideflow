import { Template } from 'meteor/templating'

import { Services } from '/imports/modules/services/both/collection'

import { servicesAvailable } from '/imports/services/_root/client'

Template['services.one.edit'].helpers({
  Services: function () {
    return Services
  },
  serviceUpdateForm: function() {
    return servicesAvailable.find(s => s.name === this.type).templates.updateForm
  },
  serviceUpdateFormPre: function() {
    try {
      return servicesAvailable.find(s => s.name === this.type).templates.updateFormPre
    }
    catch (ex) {
      return null
    }
  },
  serviceUpdateFormAfter: function() {
    try {
      return servicesAvailable.find(s => s.name === this.type).templates.updateFormAfter
    }
    catch (ex) {
      return null
    }
  },
  serviceService: function () {
    if (!this.service) return
    return servicesAvailable.find(sa => sa.name === this.service.type)
  }
})