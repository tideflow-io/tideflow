import { Template } from 'meteor/templating'
import { Files } from '/imports/modules/files/both/collection'

Template['servicesPdfCreateFromHtmlConfig'].helpers({
  files: function () {
    return Files.find({
      ext: 'html'
    })
  }
})