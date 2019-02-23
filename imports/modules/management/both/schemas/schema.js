import SimpleSchema from "simpl-schema"

const SettingsSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  public: {
    type: Boolean,
    optional: true
  },
  type: {
    type: String,
    optional: true
  },
  settings: {
    optional: true,
    type: Object,
    blackbox: true
  }
})

export default SettingsSchema