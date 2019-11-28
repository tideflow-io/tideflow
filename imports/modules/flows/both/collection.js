import { Mongo } from 'meteor/mongo'

import FlowSchema from './schemas/schema'

export const Flows = new Mongo.Collection('flows')

// We use explicit methods, so deny everything
Flows.allow({
  insert() {
    return false
  },
  update() {
    return false
  },
  remove() {
    return false
  }
})

Flows.deny({
  insert() {
    return true
  },
  update() {
    return true
  },
  remove() {
    return true
  }
})

// Must remember to attach the schema to the collection
Flows.attachSchema(FlowSchema)