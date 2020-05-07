import { Template } from 'meteor/templating'
import { Files } from '/imports/modules/files/both/collection'

Template['servicesfileReadfileConfig'].helpers({
  files: function () {
    return Files.find()
  }
})