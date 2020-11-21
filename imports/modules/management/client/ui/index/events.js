import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { sAlert } from 'meteor/juliancwirko:s-alert'

import i18n from 'meteor/universe:i18n'

Template['management.index'].events({
  'submit #site-update': (event, template) => {
    event.preventDefault()
    Meteor.call('site-settings', {
      title: event.target.title.value,
      showTitle: !!event.target['show-site-title'].checked
    }, (error, result) => {
      if (error) {
        let errorMessage = 'management.site.error'
        if (error.error === 'title-empty') {
          errorMessage = 'management.site.title.empty'
        }
        sAlert.error(i18n.__(errorMessage))
      }
      else {
        sAlert.success(i18n.__('management.site.ok'))
      }
    })
  }
})