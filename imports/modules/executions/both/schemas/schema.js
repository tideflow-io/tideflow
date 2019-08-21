import SimpleSchema from 'simpl-schema'

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
  service: {
    type: String,
    label: 'Service',
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  fullService: {
    type: Object,
    label: 'Full service',
    optional: true,
    blackbox: true
  },
  flow: {
    type: String,
    label: 'Flow',
    regEx: SimpleSchema.RegEx.Id,
    optional: false
  },
  triggerData: {
    type: Array,
    optional: true
  },
  'triggerData.$': {
    type: Object,
    optional: true,
    blackbox: true
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
  lapsed: { // Seconds
    type: Number,
    optional: true
  },
  extras: {
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

export default ExecutionSchema