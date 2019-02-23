import { Template } from 'meteor/templating'

import i18n from 'meteor/universe:i18n'

Template['management.index'].events({
  'submit #site-update': (event, template) => {
    event.preventDefault()
    let title = event.target.title.value
    Meteor.call('site-settings', { title }, (error, result) => {
      if (error) {
        let errorMessage = 'mngmnt.site.error'
        
        if (error.error === 'title-empty') {
          errorMessage = 'mngmnt.site.title.empty'
        }

        console.log({errorMessage})

        sAlert.error(i18n.__(errorMessage))
      }
      else {
        sAlert.success(i18n.__('mngmnt.site.ok'))
      }
    })
  }
})