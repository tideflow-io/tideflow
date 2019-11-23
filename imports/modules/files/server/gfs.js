import { MongoInternals } from 'meteor/mongo'

let grd = new MongoInternals.NpmModule.GridFSBucket(
  MongoInternals.defaultRemoteCollectionDriver().mongo.db,
  { bucketName: 'attachments' }
)

export const gfs = grd