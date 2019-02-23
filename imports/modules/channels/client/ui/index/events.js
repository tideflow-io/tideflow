import { Template } from 'meteor/templating'
import { servicesAvailable } from '/imports/services/_root/client'

Template.channelsIndexTableChannel.events({
  'click': (event, template) => {
    Router.go('channels.one.edit', {
      _id: template.data._id,
      type: template.data.type
    })
  }
})