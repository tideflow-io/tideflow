import SimpleSchema from "simpl-schema"

const ExecutionlogSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  event: {
    type: String,
    optional: false
  },
  type: {
    type: String,
    optional: false
  },
  user: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  execution: {
    type: String,
    label: 'Execution',
    regEx: SimpleSchema.RegEx.Id,
    optional: false
  },
  flow: {
    type: String,
    label: 'Flow',
    regEx: SimpleSchema.RegEx.Id,
    optional: false
  },
  step: {
    type: String,
    label: 'Step',
    // regEx: SimpleSchema.RegEx.Id,
    optional: false
  },
  status: { // success error stopped
    type: String,
    label: 'Status',
    optional: true
  },
  stepResults: {
    type: Array,
    label: 'Step results',
    optional: true
  },
  'stepResults.$': {
    type: Object,
    label: 'Step result',
    blackbox: true
  },
  msgs: {
    type: Array,
    label: 'Messages',
    optional: true
  },
  'msgs.$': {
    type: Object,
    label: 'Message',
    optional: true
  },
  'msgs.$.m': {
    type: String,
    label: 'Message text',
    optional: true
  },
  'msgs.$.err': {
    type: Boolean,
    label: 'It\'s an error',
    optional: true
  },
  'msgs.$.p': {
    type: Array,
    label: 'Parameters',
    optional: true
  },
  'msgs.$.p.$': {
    type: String,
    label: 'Parameter',
    optional: true
  },
  'msgs.$.d': {
    type: Date,
    label: 'Date',
    optional: true
  },
  next: {
    type: Boolean,
    label: 'Execute next step inmediately',
    optional: true
  },
  stdout: {
    type: String,
    label: 'stdout',
    optional: true
  },
  stderr: {
    type: String,
    label: 'stderr',
    optional: true
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

export default ExecutionlogSchema