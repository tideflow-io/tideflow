import i18n from 'meteor/universe:i18n'
import { Template } from 'meteor/templating'

Template.triggerEditorCronEventCalled.events({
  'keyup [name="trigger.config.cron"]': (event, template) => {
    const cronValue = event.target.value

    $('#cron-schedule-help').text(i18n.__('validation.cron.wait'))

    if (!cronValue || cronValue.trim() === '' || cronValue.length < 6 || cronValue.length > 20) {
      $('#cron-schedule-help').text(i18n.__('s-cron.validation.cron.error'))
      return
    }

    Meteor.call('s-cron-validate', cronValue, (error, result) => {
      if (error || result === false) {
        $('#cron-schedule-help').text(i18n.__('s-cron.validation.cron.error'))
        return
      }
      $('#cron-schedule-help').text(i18n.__('s-cron.validation.cron.ok'))
    })
  }
})