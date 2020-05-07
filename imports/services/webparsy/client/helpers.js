import { Template } from 'meteor/templating'
import { Files } from '/imports/modules/files/both/collection'

Template['servicesWebparsyScrapeConfig'].helpers({
  files: function () {
    return Files.find({
      ext: 'yml'
    })
  }
})
