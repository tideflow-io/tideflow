import { Accounts } from 'meteor/accounts-base'

Accounts.config({sendVerificationEmail: true})

Accounts.validateLoginAttempt(function(options) {
  /* options:
      type            (String)    The service name, such as "password" or "twitter".
      allowed         (Boolean)   Whether this login is allowed and will be successful.
      error           (Error)     When allowed is false, the exception describing why the login failed.
      user            (Object)    When it is known which user was attempting to login, the Meteor user object.
      connection      (Object)    The connection object the request came in on.
      methodName      (String)    The name of the Meteor method being used to login.
      methodArguments (Array)     An array of the arguments passed to the login method
  */

  // If the login has failed, just return false.
  if (!options.allowed) {
    return false
  }

  // Check the user's email is verified. If users may have multiple 
  // email addresses (or no email address) you'd need to do something
  // more complex.
  if (options.user.emails[0].verified === true) {
    return true
  } else {
    throw new Meteor.Error('email-not-verified')
  }
})