import { Settings } from '/imports/modules/management/both/collection'

/**
 * 
 */
module.exports.getSetting = (type, setting) => {
  const sets = Settings.findOne({type: type})
  return sets && sets.settings && sets.settings[setting] ? sets.settings[setting] : null
}