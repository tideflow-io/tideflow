import { Template } from 'meteor/templating'
import { Files } from '/imports/modules/files/both/collection.js'

Template['servicesPdfCreateFromHtmlConfig'].helpers({
  files: function () {
    return Files.find({
      ext: 'html'
    })
  }
})