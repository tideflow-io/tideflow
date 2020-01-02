import { Mongo } from 'meteor/mongo'

import KeySchema from './schemas/schema'

export const Keys = new Mongo.Collection('keys')

// We use explicit methods, so deny everything
Keys.allow({
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

Keys.deny({
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
Keys.attachSchema(KeySchema)