Template.verifyIndex.onRendered(function() {
  let instance = this
  Session.set('verifyMessage', null)
  Accounts.verifyEmail(instance.data.token, (error, result) => {
    if (error) {
      Session.set('verifyMessage', i18n.__('verify.error'))
      return
    }
    Router.go('home')
  })
})