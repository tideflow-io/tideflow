import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Router } from 'meteor/iron:router'
import { sAlert } from 'meteor/juliancwirko:s-alert'

import i18n from 'meteor/universe:i18n'

Template['membership.profile.notifications'].events({
  'submit form': function(event) {
    event.preventDefault()
    let schedule = event.target.notificationsSchedule.value

    Meteor.call('profileNotifications.update', {
      myExecutions: {
        schedule
      }
    }, (error) => {
      if (error) {
        sAlert.error(i18n.__('profileNotifications.update.error'))
        return
      }
      sAlert.success(i18n.__('profileNotifications.update.success'))
    })
  }
})