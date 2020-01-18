import { Template } from 'meteor/templating'

import { Files } from '/imports/modules/files/both/collection.js'

Template['files.new'].helpers({
  Files,
  currentTeamId: () => Session.get('currentTeamId')
})