import { Mongo } from 'meteor/mongo'

import SettingsSchema from './schemas/schema'

export const Settings = new Mongo.Collection('settings')

// We use explicit methods, so deny everything
Settings.allow({
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

Settings.deny({
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
Settings.attachSchema(SettingsSchema)