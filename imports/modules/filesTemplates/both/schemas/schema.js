import SimpleSchema from 'simpl-schema'

SimpleSchema.extendOptions(['autoform'])

import { list as typesList } from '../list'

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
