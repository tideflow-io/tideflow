import { Meteor } from 'meteor/meteor'

import { Settings } from '/imports/modules/management/both/collection'

module.exports.getOne = (type, setting) => {
  const st = Settings.findOne({ type })
  return st && st.settings ? st.settings[setting] || null : null
}
