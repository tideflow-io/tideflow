import { Template } from 'meteor/templating'

import { Flows } from '/imports/modules/flows/both/collection'

Template['flows.one.edit'].helpers({
  Flows: function () {
    return Flows
  }
})

Template['flows.one'].helpers({
  Flows: function () {
    return Flows
  }
})