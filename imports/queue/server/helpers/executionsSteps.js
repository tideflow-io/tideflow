import { ExecutionsLogs } from '/imports/modules/executionslogs/both/collection'

/**
 * 
 * @param {Object} logData
 */
const create = (logData) => {
  return ExecutionsLogs.insert(logData)
}

module.exports.create = create

const update = (execution, log, update) => {
  return ExecutionsLogs.update({_id: log, execution}, update)
}

module.exports.update = update

/**
 * @todo do not use fetch
 * @param {String} execution 
 * @param {Array} steps 
 */
const get = (execution, steps) => {
  if (!steps) {
    return ExecutionsLogs.find({
      execution
    }, {
      sort: {
        createdAt: -1
      }
    }).fetch()
  }

  if (!Array.isArray(steps)) throw new Error('steps must be an array')
  if (!steps.length) return []

  return ExecutionsLogs.find({
    execution,
    step: { $in: steps }
  }).fetch()
}

module.exports.get = get