import { Mongo } from 'meteor/mongo'

import schema from './schemas/schema'

export const FilesTemplatesCategories = new Mongo.Collection('filesTemplatesCategories')

// We use explicit methods, so deny everything
FilesTemplatesCategories.allow({
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

FilesTemplatesCategories.deny({
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
FilesTemplatesCategories.attachSchema(schema)
