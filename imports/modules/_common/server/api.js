import { Meteor } from 'meteor/meteor'
import { Keys } from '../../profileKeys/both/collection'

/**
 * 
 * @param {Object} res 
 * @param {Object} data 
 * @param {Number} status 
 */
const reply = (res, data, status) => {
  res.writeHead(status || 200)
  if (typeof data === 'object') {
    res.end(JSON.stringify(data, null, 2))
  }
  else {
    res.end(data)
  }
}

module.exports.reply = reply

/**
 * Returns the user's who owns the authentication token
 * 
 * @param {object} requestHeaders 
 */
const authenticate = async (requestHeaders) => {
  return new Promise((resolve, reject) => {
    if (!requestHeaders || !requestHeaders['api-key']) {
      return reject('apikey-no-provided')
    }
  
    const autheticationToken = requestHeaders['api-key']
  
    const key = Keys.findOne({key: autheticationToken})
    if (!key) return reject('apikey-not-found')
  
    const user = Meteor.users.findOne({_id: key.user}, {
      fields: { services: false }
    })
    if (!user) return reject('user-not-found')
  
    return resolve(user)
  })
  
}

module.exports.authenticate = authenticate

const catchHandler = (res, ex) => {
  if (typeof ex === 'string') {
    if (ex.startsWith('apikey')) return reply(res, undefined, 401)
  }
  console.error(ex)
  reply(res, undefined, 505)
}

module.exports.catchHandler = catchHandler