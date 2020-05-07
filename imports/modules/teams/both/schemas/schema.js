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
    optional: true
  },
  user: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  systemDefault: {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  members: {
    type: Array,
    optional: true
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
    allowedValues: ['admin', 'member'],
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