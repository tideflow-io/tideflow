import { Template } from 'meteor/templating'
import { siteName } from '/imports/helpers/both/tideflow'

Template['management.index'].helpers({
  siteName: () => siteName() || 'Tideflow'
})