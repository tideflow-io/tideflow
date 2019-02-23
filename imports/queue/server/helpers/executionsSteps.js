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
 * 
 * @param {String} execution 
 * @param {String} step 
 */
const get = (execution, step) => {
  if (step) {
    return ExecutionsLogs.findOne({
      execution,
      step
    })
  }
  else {
    return ExecutionsLogs.find({
      execution
    }, {
      sort: {
        createdAt: -1
      }
    })
  }
}

module.exports.get = get