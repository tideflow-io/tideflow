import { Template } from 'meteor/templating'
import { sAlert } from 'meteor/juliancwirko:s-alert'

import i18n from 'meteor/universe:i18n'

Template['management.permissions'].events({
  'submit #permissions-update': (event, template) => {
    event.preventDefault()
    const signupsType = event.target.signupsType.value
    let signupsDomain = event.target.domain.value

    if (signupsType === 'domain') {
      if (!signupsDomain || signupsDomain.trim() === '') {
        sAlert.error(i18n.__('management.permissions.submit.invalidDomain'))
        return;
      }
    }

    Meteor.call('site-permissions-settings', {
      signupsType,
      signupsDomain
    }, (error, result) => {
      if (error) {
        sAlert.error(i18n.__('management.permissions.submit.error'))
      }
      else {
        sAlert.success(i18n.__('management.permissions.submit.ok'))
      }
    })
  }
})