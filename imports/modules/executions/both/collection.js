import { Mongo } from "meteor/mongo"

import ExecutionSchema from "./schemas/schema"

export const Executions = new Mongo.Collection('executions')

// We use explicit methods, so deny everything
Executions.allow({
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

Executions.deny({
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
Executions.attachSchema(ExecutionSchema)