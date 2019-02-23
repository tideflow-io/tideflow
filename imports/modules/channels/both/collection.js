import { Mongo } from "meteor/mongo"

import ChannelSchema from "./schemas/schema"

export const Channels = new Mongo.Collection('channels')

// We use explicit methods, so deny everything
Channels.allow({
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

Channels.deny({
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
Channels.attachSchema(ChannelSchema)