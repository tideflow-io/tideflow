import { Executions } from '/imports/modules/executions/both/collection'

/**
 * 
 * @param {*} execution 
 */
const create = (service, flow, status) => {
  return Executions.insert({
    user: flow.user,
    service: service._id ? service._id : null,
    fullService: service,
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
 * @param {String} _id Execution id
 * @param {String} execution 
 */
const end = (_id, status) => {
  return Executions.update(
    { _id },
    { $set: { status: status || 'finished' } }
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