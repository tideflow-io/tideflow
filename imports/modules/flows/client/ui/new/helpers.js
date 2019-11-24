import { Template } from 'meteor/templating'

import { Flows } from '/imports/modules/flows/both/collection.js'

Template['flows.new'].helpers({
  Flows
})