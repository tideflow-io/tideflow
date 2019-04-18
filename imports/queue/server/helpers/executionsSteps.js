import { ExecutionsLogs } from '/imports/modules/executionslogs/both/collection'

/**
 * 
 * @param {Object} logData
 */
const create = (logData) => {
  return ExecutionsLogs.insert(logData)
}

module.exports.create = create

/**
 * 
 * @param {String} execution 
 * @param {String} log 
 * @param {Object} update 
 */
const update = (execution, log, update) => ExecutionsLogs.update({_id: log, execution}, update)

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

/**
 * Get the number of executed steps for a given execution id.
 * 
 * @param {String} execution The execution's id to check against.
 * @param {Array} stepIndexes 
 * @param {Array} statuses 
 */
const countForExecution = (executionId, stepIndexes, statuses) => {
  if (!executionId) throw new Error('Execution ID not provided')

  let query = {
    execution: executionId
  }

  if (stepIndexes) query.stepIndex = {$in: Array.isArray(stepIndexes) ? stepIndexes : [stepIndexes] }
  if (statuses) query.status = {$in: Array.isArray(statuses) ? statuses : [statuses] }

  return ExecutionsLogs.count(query)
}

module.exports.countForExecution = countForExecution