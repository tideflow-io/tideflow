import { Template } from 'meteor/templating'
import { servicesAvailable } from '/imports/services/_root/client'

Template['channels.new'].helpers({
  servicesAvailable: servicesAvailable.filter(sa => sa.ownable)
})