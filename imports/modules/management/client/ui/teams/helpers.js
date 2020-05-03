import { Template } from 'meteor/templating'
import { Settings } from '/imports/modules/management/both/collection'
import { Teams } from '/imports/modules/teams/both/collection'

Template['management.teams'].helpers({
  teams: () => Teams.find({}, {
    sort: {
      name: 1
    }
  }),
  teamsConfig: () => {
    const st = Settings.findOne({ type: 'teamsCreation' })
    return st && st.settings ? st.settings : {}
  }
})