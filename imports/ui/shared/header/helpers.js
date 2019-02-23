import { Template } from 'meteor/templating'
import { Settings } from '/imports/modules/management/both/collection'

Template.appHeader.helpers({
  siteName: () => {
    const st = Settings.findOne({
      type: 'siteSettings'
    })
    return st && st.settings ? st.settings.title || 'Another Tideflow platform' : 'Another Tideflow platform'
  }
})