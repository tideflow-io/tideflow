import SimpleSchema from 'simpl-schema'

const KeySchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  user: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: false
  },
  key: {
    type: String,
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
  }
})

export default KeySchema