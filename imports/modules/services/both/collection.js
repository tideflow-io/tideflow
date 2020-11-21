import { Mongo } from 'meteor/mongo'

import ServiceSchema from './schemas/schema'

export const Services = new Mongo.Collection('services')

// We use explicit methods, so deny everything
Services.allow({
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

Services.deny({
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

Services.attachSchema(ServiceSchema)