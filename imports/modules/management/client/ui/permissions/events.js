import { Template } from 'meteor/templating'

import i18n from 'meteor/universe:i18n'

Template['management.permissions'].events({
  'submit #permissions-update': (event, template) => {
    event.preventDefault()
    const signupsType = event.target.signupsType.value
    let signupsDomain = event.target.domain.value

    if (signupsType === 'domain') {
      if (!signupsDomain || signupsDomain.trim() === '') {
        sAlert.error(i18n.__('mngmnt.permissions.submit.invalidDomain'))
        return;
      }
    }

    Meteor.call('site-permissions-settings', {
      signupsType,
      signupsDomain
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