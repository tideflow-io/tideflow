import { Meteor } from 'meteor/meteor'
import { Keys } from '../../profileKeys/both/collection.js'

/**
 * Returns the user's who owns the authentication token
 * 
 * @param {object} requestHeaders 
 */
const authenticate = async (requestHeaders) => {
  return new Promise((resolve, reject) => {
    if (!requestHeaders || !requestHeaders['api-key']) {
      return reject('no-api-key-provided')
    }
  
    const autheticationToken = requestHeaders['api-key']
  
    const key = Keys.findOne({key: autheticationToken})
    if (!key) return reject('no-api-key-found')
  
    const user = Meteor.users.findOne({_id: key.user}, {
      fields: { services: false }
    })
    if (!user) return reject('no-user-found')
  
    return resolve(user)
  })
  
}

module.exports.authenticate = authenticate