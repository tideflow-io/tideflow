import { Mongo } from 'meteor/mongo'

import TeamsSchema from './schemas/schema'

export const Teams = new Mongo.Collection('teams')

// We use explicit methods, so deny everything
Teams.allow({
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

Teams.deny({
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
Teams.attachSchema(TeamsSchema)