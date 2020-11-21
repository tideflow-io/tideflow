import { Template } from 'meteor/templating'
import { siteName, siteSetting } from '/imports/helpers/both/tideflow'

Template['management.index'].helpers({
  siteName: () => siteName() || 'Tideflow',
  showTitle: () => siteSetting('showTitle', false)
})