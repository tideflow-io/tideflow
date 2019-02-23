/**
 * 
 * @param {*} user 
 */
const userEmail = (user) => {
  let userEmail = user.emails.find(email => email.varified)
  if (!userEmail || !userEmail.address) {
    userEmail = user.emails[0]
  }
  if (!userEmail || !userEmail.address) {
    throw new Error('No emails registered')
  }

  return userEmail.address
}

module.exports.userEmail = userEmail