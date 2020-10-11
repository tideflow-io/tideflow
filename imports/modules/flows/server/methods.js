import { Random } from 'meteor/random'
import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import {
  flows as flowsHooks,
  flowCapabilities 
} from '/imports/services/_root/server'
import { pick } from '/imports/helpers/both/objects'

import { Services } from '../../services/both/collection'
import { Flows } from '../both/collection'
import { Executions } from '../../executions/both/collection'
import { ExecutionsLogs } from '../../executionslogs/both/collection'

import { isMember } from '../../_common/both/teams'
import { servicesAvailable } from '/imports/services/_root/server'

import schema from '../both/schemas/schema.js'

/**
 * SECURITY!
 * 
 * Given a flow, determine if the current logged in user have access to the
 * services the flow integrates with.
 * 
 * This prevents attackers from making use of other teams owned resources.
 * 
 * https://github.com/tideflow-io/tideflow/issues/92
 * 
 * @param {Object} flow 
 * @param {String} teamId
 */
const checkIntegrationsPermission = (flow, teamId) => {
  if (!flow || !teamId) return false

  // Hold the list of ownable services to validate
  let ownableServices = []

  const { trigger, steps } = flow

  let triggerService = servicesAvailable.find(sa => {
    return sa.name === trigger.type && sa.ownable === true
  })
  
  if (triggerService) { // validate the integration shares workflow's team
    ownableServices.push({
      type: triggerService.type,
      _id: trigger._id
    })
  }

  (steps||[]).map(step => {
    let taskService = servicesAvailable.find(sa => {
      return sa.name === step.type && sa.ownable === true
    })

    if (!taskService) return false
    if (!step.config || !step.config._id) return false

    ownableServices.push({ // validate the integration shares workflow's team
      type: taskService.name,
      _id: step.config._id
    })
  })

  // No services to check. So user can proceed
  if (!ownableServices.length) return true

  let count = Services.find({
    $and: [
      { team: teamId },
      {
        $or: ownableServices
      }
    ]
  }).count()

  return ownableServices.length === count
}

export const createFlow = new ValidatedMethod({
  name: 'flows.create',
  validate: schema.validator(),
  run(flow) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')

    if (!isMember(Meteor.userId(), flow.team)) throw new Meteor.Error('no-access')

    // Check if the user is using other teams services
    if (!checkIntegrationsPermission(flow, flow.team)) throw new Meteor.Error('no-access')

    // Some hooks may need to have a pre-defined _id
    flow._id = Random.id()
    
    // Ensure the flow's owner is the logged-in user
    flow.user = Meteor.userId()

    // Execute the hooks
    flow = flowsHooks.create.pre(flow)

    flow.capabilities = flowCapabilities(flow)

    Flows.insert(flow)

    return pick(flowsHooks.create.post(flow), ['_id', 'team'])
  }
})

export const updateFlow = new ValidatedMethod({
  name: 'flows.update',
  validate: schema.validator(),

  /**
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

    if (!originalFlow) throw new Meteor.Error('not-found')

    // Check if the user can update the flow
    if (!isMember(Meteor.userId(), originalFlow.team)) throw new Meteor.Error('no-access')

    // Check if the user is using other teams services
    if (!checkIntegrationsPermission(flow, originalFlow.team)) throw new Meteor.Error('no-access')

    // Now we need to build the hook's new object
  
    let newFlowProps = {
      _id: flow._id,
      title: flow.title,
      status: flow.status,
      description: flow.description,
      steps: flow.steps,
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
      capabilities: flowCapabilities(afterPreHookDoc),
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
