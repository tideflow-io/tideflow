import { HTTP } from 'meteor/http'

const BASE_URL = 'https://api.github.com'

let createCheckrun = async (service, repo, check_suite, executionId, status) => {
  const url = `${BASE_URL}/repos/${repo.full_name}/check-runs`

  return new Promise((reject, response) => {
    HTTP.call('POST', url, {
      headers: {
        'User-Agent': 'Tideflow'
      },
      data: {
        name: `Tideflow ${executionId}`,
        head_sha: check_suite.head_sha,
        status: status || 'in_progress',
        external_id: executionId,
        started_at: new Date()
      }
    }, (error, result) => {
      console.log({
        error, result
      })
      return error ? reject(error) : response(result)
    })
  })
  
}

module.exports.createCheckrun = createCheckrun

let updateCheckrun = async (service, repo, check_suite, check_run, executionId, status, conclusion) => {
  const url = `${BASE_URL}/repos/${repo.full_name}/check-runs/${check_run.id}`

  return new Promise((reject, response) => {
    HTTP.call('POST', url, {
      headers: {
        'User-Agent': 'Tideflow'
      },
      data: {
        status: status || 'completed',
        conclusion: conclusion || 'success',
        completed_at: new Date()
      }
    }, (error, result) => {
      console.log({
        error, result
      })
      return error ? reject(error) : response(result)
    })
  })
  
}

module.exports.updateCheckrun = updateCheckrun