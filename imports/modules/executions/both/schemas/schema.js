import SimpleSchema from "simpl-schema"

// ***************************************************************
// Document schema
// ***************************************************************

const ExecutionSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  user: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  channel: {
    type: String,
    label: 'Channel',
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  fullChannel: {
    type: Object,
    label: 'Full channel',
    optional: true,
    blackbox: true
  },
  flow: {
    type: String,
    label: 'Flow',
    regEx: SimpleSchema.RegEx.Id,
    optional: false
  },
  fullFlow: {
    type: Object,
    label: 'Full flow',
    optional: false,
    blackbox: true
  },
  status: { // started finished error stopped
    type: String,
    label: 'Status',
    optional: false
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

export default ExecutionSchema