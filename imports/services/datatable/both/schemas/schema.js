import SimpleSchema from 'simpl-schema'

// ***************************************************************
// Document schema
// ***************************************************************

const ServiceDataTableRecordSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  channel: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: false
  },
  user: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: false
  },
  cardinality: {
    type: Number,
    optional: false
  },
  data: {
    optional: true,
    type: Object,
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

export default ServiceDataTableRecordSchema