import { HTTP } from 'meteor/http'

const { createAppAuth } = require('@octokit/auth-app');

const BASE_URL = 'https://api.github.com'

const appAuth = (context, installation) => {
  const { pem, secret, appId, clientId } = context.config

  return createAppAuth({
    id: appId,
    privateKey: pem,
    clientId: clientId,
    clientSecret: secret,
    installationId: installation.id
  })({type: 'installation'})
}

let createCheckrun = async (service, webhook, execution, status) => {
  const { repository, check_suite, installation } = webhook
  const url = `${BASE_URL}/repos/${repository.full_name}/check-runs`
  const auth = await appAuth(service, installation)

  return new Promise((resolve, reject) => {
    HTTP.call('POST', url, {
      headers: {
        'User-Agent': 'Tideflow',
        'Accept': 'application/vnd.github.antiope-preview+json',
        'authorization': `Bearer ${auth.token}`
      },
      data: {
        name: `Tideflow ${execution._id}`,
        head_sha: check_suite.head_sha,
        status: status || 'in_progress',
        details_url: `${process.env.ROOT_URL || 'https://tideflow.io'}flows/${execution.flow}/executions/${execution._id}`,
        external_id: execution._id,
        started_at: new Date()
      }
    }, (error, result) => {
      if (error) return reject(error)
      resolve(result)
    })
  })
  
}

module.exports.createCheckrun = createCheckrun

let updateCheckrun = async (service, webhook, check_run, status, conclusion) => {
  const { repository, installation } = webhook
  const url = `${BASE_URL}/repos/${repository.full_name}/check-runs/${check_run.id}`
  const auth = await appAuth(service, installation)
  return new Promise((resolve, reject) => {
    HTTP.call('PATCH', url, {
      headers: {
        'User-Agent': 'Tideflow',
        'Accept': 'application/vnd.github.antiope-preview+json',
        'authorization': `Bearer ${auth.token}`
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
      return error ? reject(error) : resolve(result)
    })
  })
  
}

module.exports.updateCheckrun = updateCheckrun