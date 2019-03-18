import { Channels } from '/imports/modules/channels/both/collection.js'

/**
 * 
 * @param {*} _id 
 * @param {*} property 
 */
module.exports.property = (_id, property) => {
  return (Channels.findOne({_id}) || {})[property] || null
}