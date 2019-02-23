import SimpleSchema from "simpl-schema"

// ***************************************************************
// Document schema
// ***************************************************************

const ChannelSchema = new SimpleSchema({
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
  title: {
    type: String,
    label: "Title",
    max: 120,
    optional: false
  },
  description: {
    type: String,
    label: "Description",
    max: 1000,
    optional: true
  },
  type: {
    type: String,
    label: "Type",
    max: 1000,
    optional: false
  },
  config: {
    optional: true,
    type: Object,
    blackbox: true
  },
  details: {
    optional: true,
    type: Object,
    blackbox: true
  },
  secrets: {
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

export default ChannelSchema