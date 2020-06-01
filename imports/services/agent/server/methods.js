import { Meteor } from 'meteor/meteor'

import { fileExplorer } from '/imports/services/agent/server/socket'

import { Services } from '/imports/modules/services/both/collection'

import { isMember } from '../../../modules/_common/both/teams'

Meteor.methods({
  's-agent-explorer': async (agentId, options) => {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')

    // In order to be able to disable the existing flow jobs, etc, we need to
    // grab it first.
    let originalService = Services.findOne({_id: agentId})

    if (!originalService) {
      throw new Meteor.Error('not-found')
    }

    // Check if the user can update the flow
    if (!isMember(Meteor.userId(), originalService.team)) throw new Meteor.Error('no-access')

    // check user access to team
    // Check access to agent
    // 
    const { dir } = options

    const agent = Services.findOne({
      _id: agentId,
      type: 'agent'
    })

    return await fileExplorer(agent, {
      dir
    })
  }
})