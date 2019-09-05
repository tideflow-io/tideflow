/**
 * Given a user, return its first email address, having priority verified
 * addresses.
 * 
 * @param {Object} user 
 * @returns string The user's email adress
 * @throws Exception if no user provided or no emails found
 */
const userEmail = (user) => {
  if (!user) throw new Error('No user provided')
  if (!user.emails) throw new Error('No emails array found')
  if (!user.emails.length) throw new Error('User have no emails')

  let userEmail = user.emails.find(email => email.verified)

  if (!userEmail || !userEmail.address) {
    userEmail = user.emails[0]
  }

  if (!userEmail.address) {
    throw new Error('No emails registered')
  }

  return userEmail.address
}

module.exports.userEmail = userEmail