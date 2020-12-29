import SimpleSchema from 'simpl-schema'

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
  id: {
    type: String,
    optional: false
  },
  type: {
    type: String,
    optional: false
  },
  team: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
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
  stepIndex: SimpleSchema.oneOf(
    {
      type: Number,
      label: 'Step index',
      // regEx: SimpleSchema.RegEx.Id,
      optional: false
    },
    {
      type: String,
      label: 'Step index',
      optional: false
    }
  ),
  status: { // success error stopped
    type: String,
    label: 'Status',
    defaultValue: 'pending',
    optional: false
  },
  result: {
    type: Object,
    optional: true,
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
    type: Object,
    label: 'Parameters',
    optional: true,
    blackbox: true
  },
  'msgs.$.d': {
    type: Date,
    label: 'Date',
    optional: true
  },
  bridgedIndexes: {
    type: Array,
    label: 'Bridged results',
    optional: true
  },
  'bridgedIndexes.$': {
    type: SimpleSchema.oneOf({
      type: Number
    }, {
      type: String,
      allowedValues: ['trigger']
    }),
    label: 'Bridged result',
    optional: true
  },
  next: {
    type: Boolean,
    label: 'Execute next step inmediately',
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