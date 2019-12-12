import SimpleSchema from 'simpl-schema'

SimpleSchema.extendOptions(['autoform'])

import { list as typesList } from '../list'

const Schema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  category: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: false
  },
  name: {
    type: String,
    optional: false
  },
  description: {
    type: String,
    optional: false
  },
  fileName: {
    type: String,
    optional: false
  },
  userCreated: {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  type: {
    type: String,
    autoform: {
      options: typesList
    },
    allowedValues: typesList.map(sl => sl.value),
    optional: false
  },
  content: {
    type: String,
    optional: true
  },
  form: {
    type: Object,
    optional: true,
    blackbox: true
  },
  priority: {
    type: Number,
    optional: false,
    defaultValue: 0
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
