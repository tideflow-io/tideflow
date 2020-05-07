import { Template } from 'meteor/templating'

Template['management.users'].events({
  'submit #': (event, template) => {
    event.preventDefault()
  }
})