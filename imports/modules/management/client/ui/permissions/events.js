import { Template } from 'meteor/templating'

import i18n from 'meteor/universe:i18n'

Template['management.permissions'].events({
  'submit #permissions-update': (event, template) => {
    event.preventDefault()
    let publicSignups = event.target.publicSignups.checked
    Meteor.call('site-permissions-settings', {
      publicSignups
    }, (error, result) => {
      if (error) {
        sAlert.error(i18n.__('mngmnt.permissions.submit.error'))
      }
      else {
        sAlert.success(i18n.__('mngmnt.permissions.submit.ok'))
      }
    })
  }
})