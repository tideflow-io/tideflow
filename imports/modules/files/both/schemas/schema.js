import { Random } from 'meteor/random'
import SimpleSchema from 'simpl-schema'

SimpleSchema.extendOptions(['autoform'])

const Schema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  userCreated: {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  size: {
    type: Number,
    optional: true
  },
  name: {
    type: String,
    optional: true
  },
  type: {
    type: String,
    optional: true
  },
  path: {
    type: String,
    optional: true
  },
  ext: {
    type: String,
    optional: true
  },
  content: {
    type: String,
    optional: true
  },
  'mime-type': {
    type: String,
    optional: true
  },
  meta: {
    type: Object,
    blackbox: true,
    optional: true
  },
  user: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  team: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  versions: {
    type: Array,
    optional: true
  },
  'versions.$': {
    type: Object,
    optional: true,
    blackbox: true
  },
  'versions.$.date': {
    type: Date,
    optional: false
  },
  'versions.$.size': {
    type: Number,
    optional: true
  },
  'versions.$.gfsId': {
    type: String,
    optional: false
  },
  public: {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  uniqueId: {
    type: String,
    optional: true,
    denyUpdate: true,
    autoValue: function() {
      if (this.isInsert) {
        return Random.id(30)
      }
    }
  },
  createdAt: {
    type: Date,
    optional: true,
    denyUpdate: true,
    autoValue: function() {
      if (this.isInsert) {
        return new Date()
      }
    }
  },
  updatedAt: {
    type: Date,
    optional: true,
    denyInsert: true,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date()
      }
    }
  }
})

export default Schema
