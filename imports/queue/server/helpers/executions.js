import { Executions } from '/imports/modules/executions/both/collection'

/**
 * 
 * @param {*} execution 
 */
const create = (channel, flow, status) => {
  return Executions.insert({
    user: flow.user,
    channel: channel._id ? channel._id : null,
    fullChannel: channel,
    flow: flow._id,
    fullFlow: flow,
    status: status || 'started'
  })
}

module.exports.create = create

/**
 * 
 * @param {*} execution 
 */
const get = (query) => {
  return Executions.findOne(query)
}

module.exports.get = get

/**
 * 
 * @param {*} execution 
 */
const end = (_id) => {
  return Executions.update(
    { _id },
    { $set: { status: 'finished' } }
  )
}

module.exports.end = end

/**
 * 
 * @param {*} execution 
 */
const update = (query, set) => {
  return Executions.update(
    query,
    set
  )
}

module.exports.update = update