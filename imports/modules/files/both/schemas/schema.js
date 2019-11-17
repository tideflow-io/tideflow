import SimpleSchema from 'simpl-schema'

SimpleSchema.extendOptions(['autoform'])

const Schema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  size: {
    type: Number,
    optional: true
  },
  name: {
    type: String,
    optional: true
  },
  type: {
    type: String,
    optional: true
  },
  path: {
    type: String,
    optional: true
  },
  isVideo: {
    type: Boolean,
    optional: true
  },
  isAudio: {
    type: Boolean,
    optional: true
  },
  isImage: {
    type: Boolean,
    optional: true
  },
  isText: {
    type: Boolean,
    optional: true
  },
  isJSON: {
    type: Boolean,
    optional: true
  },
  isPDF: {
    type: Boolean,
    optional: true
  },
  extension: {
    type: String,
    optional: true
  },
  ext: {
    type: String,
    optional: true
  },
  extensionWithDot: {
    type: String,
    optional: true
  },
  mime: {
    type: String,
    optional: true
  },
  'mime-type': {
    type: String,
    optional: true
  },
  _storagePath: {
    type: String,
    optional: true
  },
  _downloadRoute: {
    type: String,
    optional: true
  },
  _collectionName: {
    type: String,
    optional: true
  },
  public: {
    type: Boolean,
    optional: true
  },
  meta: {
    type: Object,
    blackbox: true,
    optional: true
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  content: {
    type: String,
    autoform: {
      rows: 10
    },
    optional: true
  },
  versions: {
    type: Object,
    blackbox: true,
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

export default Schema