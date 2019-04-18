import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'debug',
  humanName: 's-debug.name',
  ownable: false,
  templates: {
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
      callback: () => { return {} },
      conditions: []
    },
    {
      name: 'e2',
      humanName: 'debug e2',
      viewerTitle: 's-debug.events.e2.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} },
      conditions: []
    },
    {
      name: 'e3',
      humanName: 'debug e3',
      viewerTitle: 's-debug.events.e3.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} },
      conditions: []
    },
    {
      name: 'e4',
      humanName: 'debug e4',
      viewerTitle: 's-debug.events.e4.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} },
      conditions: []
    },
    {
      name: 'e5',
      humanName: 'debug e5',
      viewerTitle: 's-debug.events.e5.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} },
      conditions: []
    },
    {
      name: 'e6',
      humanName: 'debug e6',
      viewerTitle: 's-debug.events.e6.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} },
      conditions: []
    },
    {
      name: 'e7',
      humanName: 'debug e7',
      viewerTitle: 's-debug.events.e7.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} },
      conditions: []
    },
    {
      name: 'e8',
      humanName: 'debug e8',
      viewerTitle: 's-debug.events.e8.title',
      inputable: false,
      stepable: true,
      callback: () => { return {} },
      conditions: []
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)