import SimpleSchema from 'simpl-schema'

import { Services } from "/imports/modules/services/both/collection.js"
import { list as statusList } from '/imports/modules/flows/both/list'

const FlowSchema = new SimpleSchema({
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
  emailOnTrigger: {
    label: i18n.__('flows.properties.emailOnTrigger'),
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  status: {
    type: String,
    label: "Status",
    autoform: {
      options: statusList
    },
    allowedValues: statusList.map(sl => sl.value),
    optional: false
  },
  title: {
    type: String,
    label: 'Title',
    max: 1000,
    optional: true
  },
  description: {
    type: String,
    label: 'Description',
    max: 1000,
    optional: true
  },
  trigger: {
    type: Object,
    optional: false
  },
  'trigger.type': {
    type: String,
    optional: false
  },
  'trigger._id': {
    type: String,
    optional: true
  },
  'trigger.event': {
    type: String,
    optional: true
  },
  'trigger.config': {
    optional: true,
    type: Object,
    blackbox: true
  },
  'trigger.x': {
    optional: true,
    type: Number,
    defaultValue: 0
  },
  'trigger.y': {
    optional: true,
    type: Number,
    defaultValue: 0
  },
  'trigger.outputs': {
    type: Array,
    optional: true
  },
  'trigger.outputs.$': {
    type: Object,
    optional: true
  },
  'trigger.outputs.$.stepIndex': {
    label: 'Trigger output steps index',
    type: Number
  },
  'trigger.secrets': {
    optional: true,
    type: Object,
    blackbox: true
  },
  steps: {
    type: Array,
    optional: true
  },
  'steps.$': {
    type: Object,
    optional: true
  },
  'steps.$.outputs': {
    type: Array,
    optional: true
  },
  'steps.$.outputs.$': {
    type: Object,
    optional: true
  },
  'steps.$.outputs.$.stepIndex': {
    label: 'Step output steps index',
    type: Number
  },
  'steps.$.x': {
    type: Number,
    defaultValue: 0
  },
  'steps.$.y': {
    type: Number,
    defaultValue: 0
  },
  'steps.$.type': {
    type: String
  },
  'steps.$._id': {
    type: String,
    optional: true
  },
  'steps.$.event': {
    type: String,
    optional: true
  },
  'steps.$.config': {
    type: Object,
    optional: true,
    blackbox: true
  },
  'steps.$.conditions': {
    type: Array,
    optional: true
  },
  'steps.$.conditions.$': {
    type: Object
  },
  'steps.$.conditions.$.type': {
    type: String
  },
  'steps.$.conditions.$.value': {
    type: String
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

export default FlowSchema