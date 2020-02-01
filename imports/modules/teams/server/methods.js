import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { check } from 'meteor/check'

import { Teams } from '/imports/modules/teams/both/collection'

const slugify = require('slugify')

Meteor.methods({
  'teams.create' (teamData) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')

    check(teamData, {
      name: String
    })

    let { name } = teamData

    name = name.trim()
    let slug = slugify(name)

    if (name.length < 5) throw new Meteor.Error('name-too-short') 

    let existingTeam = Teams.findOne({$or:[
      { name },
      { slug }
    ]})

    if (existingTeam) throw new Meteor.Error('already-exists')
    
    // Check if group already exists
    return Teams.insert({
      name,
      slug,
      user: Meteor.userId(),
      members: [{
        user: Meteor.userId(),
        role: 'admin'
      }]
    })
  },
  'team.update' (teamData) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    console.log({teamData})
    check(teamData, {
      _id: String,
      name: String
    })

    let { name, _id } = teamData

    let existingTeam = Teams.findOne({ name, _id: { $ne: _id } })

    if (existingTeam) throw new Meteor.Error('already-exists')

    // Check if group already exists
    return Teams.update({ _id: teamData._id}, {
      $set: {
        name
      }
    })
  }
})