import { Mongo } from 'meteor/mongo'

import schema from './schemas/schema'

export const FilesTemplates = new Mongo.Collection('filesTemplates')

// We use explicit methods, so deny everything
FilesTemplates.allow({
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

FilesTemplates.deny({
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

FilesTemplates.attachSchema(schema)
