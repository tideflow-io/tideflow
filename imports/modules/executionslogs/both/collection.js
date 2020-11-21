import { Mongo } from 'meteor/mongo'

import ExecutionlogSchema from './schemas/schema'

export const ExecutionsLogs = new Mongo.Collection('executionslogs')

// We use explicit methods, so deny everything
ExecutionsLogs.allow({
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

ExecutionsLogs.deny({
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

ExecutionsLogs.attachSchema(ExecutionlogSchema)