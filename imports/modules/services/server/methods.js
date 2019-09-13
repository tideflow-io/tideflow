import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import { Services } from '../both/collection'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { services as servicesHooks } from '/imports/services/_root/server'
import { pick } from '/imports/helpers/both/objects'

import schema from '../both/schemas/schema'

export const createService = new ValidatedMethod({
  name: 'services.create',
  validate: schema.validator(),
  run(service) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    service.user = Meteor.userId()

    service = servicesHooks.create.pre(service)
    Services.insert(service)
    servicesHooks.create.post(service)
    return pick(service, ['_id', 'type'])
  }
})

export const updateService = new ValidatedMethod({
  name: 'services.update',
  validate: schema.validator(),
  run(service) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    const UPDATABLE_PROPERTIES = ['title', 'description', 'details', 'config', 'secrets']

    let originalService = Services.findOne({_id: service._id})

    let newServiceProperties = {}
    UPDATABLE_PROPERTIES.map(p => { newServiceProperties[p] = service[p] })

    let afterPreHookDoc = servicesHooks.update.pre(originalService, Object.assign({}, originalService, newServiceProperties))
    console.log({afterPreHookDoc})
    if (!afterPreHookDoc) {
      throw new Error('Service pre-update hook failed')
    }

    let propertiesToUpdate = {}
    UPDATABLE_PROPERTIES.map(p => { propertiesToUpdate[p] = afterPreHookDoc[p] })

    Services.update(
      { _id: service._id },
      { $set: propertiesToUpdate }
    )

    servicesHooks.update.post(originalService, afterPreHookDoc)
  }
})

export const deleteService = new ValidatedMethod({
  name: 'services.delete',
  validate: new SimpleSchema({ _id: { type: String } }).validator(),
  run(service) {
    if (!Meteor.userId()) throw new Meteor.Error('no-auth')
    
    let originalService = Services.findOne({_id: service._id})
    let docToDelete = servicesHooks.delete.pre(originalService)
    if (!docToDelete) {
      throw new Error('Deletion hook failed')
    }

    Services.remove(service._id)

    servicesHooks.delete.post(docToDelete)
  }
})