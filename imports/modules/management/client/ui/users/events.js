import { Template } from 'meteor/templating'

import i18n from 'meteor/universe:i18n'

Template['management.users'].events({
  'submit #': (event, template) => {
    event.preventDefault()
  }
})