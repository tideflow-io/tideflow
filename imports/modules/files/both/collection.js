import { Mongo } from 'meteor/mongo'

import schema from './schemas/schema'

export const Files = new Mongo.Collection('files')

// We use explicit methods, so deny everything
Files.allow({
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

Files.deny({
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

Files.attachSchema(schema)