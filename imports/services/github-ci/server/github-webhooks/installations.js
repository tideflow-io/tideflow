import { Services } from '/imports/modules/services/both/collection'

const getCurrentInstallation = (service, installation) => {
  const installationId = installation.id
  const currentInstallations = (service.details || {}).installations || []
  return currentInstallations.find(i => i.id === installationId)
}

/**
 * 
 * @param {object} service 
 * @param {object} installation 
 * @param {array} repositories 
 */
const createInstall = (service, installation, repositories) => {
  installation = _.omit(installation, ['sender']);
  installation.repositories = repositories
  
  Services.update({_id: service._id}, {
    $addToSet: {
      'details.installations': installation
    }
  })
}

/**
 * 
 * @param {Object} currentInstallation Current installation taken from TF's database
 * @param {Array} addedRepositories List of respositories added, as in github's repositories_added
 * @param {Array} removedRepositories List of respositories removed, as in github's repositories_removed
 */
const diffs = (currentInstallation, addedRepositories, removedRepositories) => {
  let pull = []
  let push = []

  if (!addedRepositories) addedRepositories = []
  if (!removedRepositories) removedRepositories = []
  
  let currentRepositoriesIds = currentInstallation.repositories.map(r => parseInt(r.id))

  addedRepositories.map(addedRepo => {
    if (!currentRepositoriesIds.includes(addedRepo.id)) {
      push.push(addedRepo)
    }
  })

  removedRepositories.map(removedRepo => {
    if (currentRepositoriesIds.includes(removedRepo.id)) {
      pull.push(removedRepo)
    }
  })

  return { pull, push }
}

const processRepoDiffs = async (service, installation, repoDiffs) => {
  let query = {}

  if (repoDiffs.pull.length) {
    let pullIds = repoDiffs.pull.map(r => r.id)
    query.$pull = { 'details.installations.$.repositories': { 'id': { $in: pullIds } } }
  }
  
  if (repoDiffs.push.length) {
    query.$push = { 'details.installations.$.repositories': { $each: repoDiffs.push } }
  }

  await Services.update({
    _id: service._id,
    'details.installations.id': installation.id
  }, query)
}

const run = (service, body) => {
  if (body.action === 'created') {
    createInstall(service, body.installation, body.repositories)
    return
  }
  else if (body.action === 'added') {
    let currentInstallation = getCurrentInstallation(service, body.installation)
    if (!currentInstallation)
      createInstall(service, body.installation, body.repositories_added)
    else { // add services
      let repoDiffs = diffs(currentInstallation, body.repositories_added, [])
      processRepoDiffs(service, currentInstallation, repoDiffs)
    }
    return
  }
  else if (body.action === 'removed') {
    let currentInstallation = getCurrentInstallation(service, body.installation)
    if (!currentInstallation) {
      // error. trying to remove repositories from an unexisting installation
      return
    }
    
    const repoDiffs = diffs(currentInstallation, [], body.repositories_removed)
    processRepoDiffs(service, currentInstallation, repoDiffs)
    return
  }
  else if (body.action === 'deleted') {
    let currentInstallation = getCurrentInstallation(service, body.installation)
    if (!currentInstallation)
      return
    else { // add services
      // remove install
    }
    return;
  }
}

module.exports.run = run