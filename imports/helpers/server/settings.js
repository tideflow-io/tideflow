import { Meteor } from 'meteor/meteor'

import { Settings } from '/imports/modules/management/both/collection'

module.exports.getOne = (type, setting) => {
  const st = Settings.findOne({ type })
  return (st || {}).settings ? setting ? st.settings[setting] : st.settings || null : null
}
