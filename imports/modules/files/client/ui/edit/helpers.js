import { Template } from 'meteor/templating'

import { Files } from '/imports/modules/files/both/collection.js'

Template['files.one.edit'].helpers({
  Files
})