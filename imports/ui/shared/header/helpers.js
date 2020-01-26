import { Template } from 'meteor/templating'
import { Settings } from '/imports/modules/management/both/collection'
import { Router } from 'meteor/iron:router'

import { Teams } from '/imports/modules/teams/both/collection'

Template.appHeader.helpers({
  siteName: () => {
    const st = Settings.findOne({
      type: 'siteSettings'
    })
    return st && st.settings ? st.settings.title || '' : ''
  },
  showLogin: () => {
    const st = Settings.findOne({})
    return !!st
  },
  'teams': () => {
    return Teams.find()
  },
})

Template.appHeaderTeam.helpers({
  'activeTeam': (template) => {
    return template.data._id === Router.current().params._id
  }
})
