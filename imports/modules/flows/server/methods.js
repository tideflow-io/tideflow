import { Random } from 'meteor/random'
import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { flows as flowsHooks } from '/imports/services/_root/server'
import { pick } from '/imports/helpers/both/objects'

import { Flows } from '../both/collection'
import { Executions } from '../../executions/both/collection'
import { ExecutionsLogs } from '../../executionslogs/both/collection'

import { isMember } from '../../_common/server/teams'

import schema from '../both/schemas/schema.js'

export const createFlow = new ValidatedMethod({
  name: 'flows.create',
  validate: schema.validator(),
  run(flow) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')

    if (!isMember(Meteor.userId(), flow.team)) throw new Meteor.Error('no-access')

    // SECURITY:
    // This can not contain the flow.trigger.secrets, and it's meant to contain
    // details uniquely created by the server.
    // flow = _.omit(flow, ['flow.trigger.secrets'])

    // Some hooks may need to have a pre-defined _id
    flow._id = Random.id()
    
    // Ensure the flow's owner is the logged-in user
    flow.user = Meteor.userId()

    // Execute the hooks
    flow = flowsHooks.create.pre(flow)

    Flows.insert(flow)

    return pick(flowsHooks.create.post(flow), ['_id'])
  }
})

export const updateFlow = new ValidatedMethod({
  name: 'flows.update',
  validate: schema.validator(),

  /**
   * 
   * @param {Object} flow Contains the flow, as it came from the client, and after
   * model validation
   */
  run(flow) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')

    // SECURITY:
    // This can not contain the flow.trigger.secrets, and it's meant to contain
    // details uniquely created by the server.
    // flow = _.omit(flow, ['flow.trigger.secrets'])

    // In order to be able to disable the existing flow jobs, etc, we need to
    // grab it first.
    let originalFlow = Flows.findOne({_id: flow._id})

    if (!originalFlow) {
      throw new Meteor.Error('not-found')
    }

    // Check if the user can update the flow
    if (!isMember(Meteor.userId(), originalFlow.team)) throw new Meteor.Error('no-access')

    // Now we need to build the hook's new object
  
    let newFlowProps = {
      _id: flow._id,
      title: flow.title,
      status: flow.status,
      description: flow.description,
      steps: flow.steps,
      emailOnTrigger: flow.emailOnTrigger,
      trigger: flow.trigger
    }

    // Hookize the flows and grab the new one
    let afterPreHookDoc = flowsHooks.update.pre(originalFlow, newFlowProps)

    // If the hooks failed to execute, probably means that a 3rd party component
    // failed to perform his job. We don't wan't to touch the database in
    // that case.
    if (!afterPreHookDoc) {
      throw new Error('Flow pre-update hook failed')
    }

    // Once the validation is done, build mongodb's $set to udpate the document.
    let set = {
      title: afterPreHookDoc.title,
      status: afterPreHookDoc.status,
      description: afterPreHookDoc.description,
      steps: afterPreHookDoc.steps,
      emailOnTrigger: afterPreHookDoc.emailOnTrigger,
      trigger: afterPreHookDoc.trigger
    }

    // Execute the update in the database
    Flows.update(
      { _id: flow._id },
      { $set: set }
    )

    // Given the original flow and the new one, perform post hooks methods
    flowsHooks.update.post(originalFlow, set)
    return flow
  }
})

export const deleteFlow = new ValidatedMethod({
  name: 'flows.delete',
  validate: new SimpleSchema({ _id: { type: String } }).validator(),
  run(flow) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    
    let originalFlow = Flows.findOne(flow)

    if (!originalFlow) {
      throw new Meteor.Error('not-found')
    }

    // Check if the user can delete the flow
    if (!isMember(Meteor.userId(), originalFlow.team)) throw new Meteor.Error('no-access')

    // Hookize the flows and grab the result
    let docToDelete = flowsHooks.delete.pre(originalFlow)

    // If the hooks failed to execute, probably means that a 3rd party component
    // failed to perform his job. We don't wan't to touch the database in
    // that case.
    if (!docToDelete) {
      throw new Error('Deletion hook failed')
    }
    
    // Execute the updates in the database
    Flows.remove(flow._id)
    Executions.remove({flow: flow._id})
    ExecutionsLogs.remove({flow: flow._id})

    // Given the original flow and the new one, perform post hooks methods
    return flowsHooks.delete.post(docToDelete)
  }
})
