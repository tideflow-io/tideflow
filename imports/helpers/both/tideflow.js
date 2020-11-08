import { Settings } from '/imports/modules/management/both/collection'

const siteName = () => {
  const st = Settings.findOne({
    type: 'siteSettings'
  })
  return st && st.settings ? st.settings.title || 'Unnamed' : 'Unnamed'
}
module.exports.siteName = siteName