import DataTableRowSchema from './schemas/schema'

export const ServiceDataTableRecords = new Mongo.Collection('s-datatable-records')

// We use explicit methods, so deny everything
ServiceDataTableRecords.allow({
  insert() {
    return false
  },
  update() {
    return false
  },
  remove() {
    return false
  }
})

ServiceDataTableRecords.deny({
  insert() {
    return true
  },
  update() {
    return true
  },
  remove() {
    return true
  }
})

// Must remember to attach the schema to the collection
ServiceDataTableRecords.attachSchema(DataTableRowSchema)