import { Template } from 'meteor/templating'
import { Settings } from '/imports/modules/management/both/collection'

Template['management.index'].helpers({
  siteName: () => {
    const st = Settings.findOne({
      type: 'siteSettings'
    })
    return st && st.settings ? st.settings.title || 'Unnamed' : 'Unnamed'
  }
})