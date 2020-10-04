import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'gh-ci',
  humanName: 's-gh-ci.name',
  description: 's-gh-ci.description',
  website: 'https://docs.tideflow.io/docs/services-gh-ci',
  icon: 'fab fa-github',
  iconColor: '#CCC',
  inputable: true,
  stepable: true,
  ownable: true,
  templates: {
    help: 'servicesGithubCiHelp',
    helpIntro: 'servicesGithubCiHelpIntro',
    detailsView: 'servicesGhCiDetailsView',
    createForm: 'servicesGhCiCreateForm',
    triggerEditorPre: 'servicesGhCiTriggerEditorPre',
    triggerEditorPost: 'servicesGhCiTriggerEditorPost'
  },
  hooks: {
    // service: {},
    // trigger: {}
  },
  events: [
    {
      name: 'pull_request',
      humanName: 's-gh-ci.events.pull_request.name',
      viewerTitle: 's-gh-ci.events.pull_request.viewer.title',
      inputable: true,
      stepable: false,
      callback: () => {}
    },
    {
      name: 'push',
      humanName: 's-gh-ci.events.push.name',
      viewerTitle: 's-gh-ci.events.push.viewer.title',
      inputable: true,
      stepable: false,
      callback: () => {}
    },
    {
      name: 'checksuite',
      humanName: 's-gh-ci.events.checksuite.name',
      viewerTitle: 's-gh-ci.events.checksuite.viewer.title',
      inputable: true,
      stepable: false,
      callback: () => {}
    },
    // {
    //   name: 'test_cmd',
    //   humanName: 's-gh-ci.events.test_cmd.name',
    //   viewerTitle: 's-gh-ci.events.test_cmd.viewer.title',
    //   inputable: false,
    //   stepable: true,
    //   templates: {
    //     eventConfig: 'servicesGithubCiBasicStep'
    //   },
    //   callback: () => {}
    // },
    {
      name: 'run_cmd',
      humanName: 's-gh-ci.events.run_cmd.name',
      viewerTitle: 's-gh-ci.events.run_cmd.viewer.title',
      inputable: false,
      stepable: true,
      templates: {
        eventConfig: 'servicesGithubCiBasicStep'
      },
      callback: () => {}
    },
    // {
    //   name: 'deploy_cmd',
    //   humanName: 's-gh-ci.events.deploy_cmd.name',
    //   viewerTitle: 's-gh-ci.events.deploy_cmd.viewer.title',
    //   inputable: false,
    //   stepable: true,
    //   templates: {
    //     eventConfig: 'servicesGithubCiBasicStep'
    //   },
    //   callback: () => {}
    // }
  ]
}

module.exports.service = service

servicesAvailable.push(service)