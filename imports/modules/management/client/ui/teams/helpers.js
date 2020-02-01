import { Template } from 'meteor/templating'
import { Settings } from '/imports/modules/management/both/collection'

Template['management.teams'].helpers({
  teamsConfig: () => {
    const st = Settings.findOne({ type: 'teamsCreation' })
    return st && st.settings ? st.settings : {}
  }
})