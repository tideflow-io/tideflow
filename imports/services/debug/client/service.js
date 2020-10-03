import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'debug',
  description: 's-debug.description',
  humanName: 's-debug.name',
  ownable: false,
  stepable: true,
  icon: 'far fa-file-code',
  templates: {
    helpIntro: 'servicesDebugHelpIntro'
  },
  hooks: {
    // service: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'e1',
      humanName: 'debug e1',
      viewerTitle: 's-debug.events.e1.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} }
    },
    {
      name: 'e2',
      humanName: 'debug e2',
      viewerTitle: 's-debug.events.e2.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} }
    },
    {
      name: 'e3',
      humanName: 'debug e3',
      viewerTitle: 's-debug.events.e3.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} }
    },
    {
      name: 'e4',
      humanName: 'debug e4',
      viewerTitle: 's-debug.events.e4.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} }
    },
    {
      name: 'e5',
      humanName: 'debug e5',
      viewerTitle: 's-debug.events.e5.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} }
    },
    {
      name: 'e6',
      humanName: 'debug e6',
      viewerTitle: 's-debug.events.e6.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} }
    },
    {
      name: 'e7',
      humanName: 'debug e7',
      viewerTitle: 's-debug.events.e7.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} }
    },
    {
      name: 'e8',
      humanName: 'debug e8',
      viewerTitle: 's-debug.events.e8.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)