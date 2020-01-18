import SimpleSchema from 'simpl-schema'

const KeySchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  name: {
    type: String,
    optional: false
  },
  slug: {
    type: String,
    optional: false
  },
  user: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: false
  },
  members: {
    type: Array,
    optional: false
  },
  'members.$': {
    type: Object,
    optional: false
  },
  'members.$.user': {
    type: SimpleSchema.RegEx.Id,
    optional: false
  },
  'members.$.role': {
    type: String,
    allowedValues: ['admin', 'manager', 'member'],
    optional: false
  },
  createdAt: {
    type: Date,
    optional: true,
    denyUpdate: true,
    autoValue: function () {
      if (this.isInsert) {
        return new Date()
      }
    }
  },
  updatedAt: {
    type: Date,
    optional: true,
    denyInsert: true,
    autoValue: function () {
      if (this.isUpdate) {
        return new Date()
      }
    }
  }
})

export default KeySchema