import { Template } from 'meteor/templating'

import { Files } from '/imports/modules/files/both/collection'

Template['files.one.edit'].helpers({
  Files
})