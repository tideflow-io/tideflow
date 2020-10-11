import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'endpoint',
  humanName: 's-endpoint.name',
  description: 's-endpoint.description',
  website: 'https://docs.tideflow.io/docs/services-endpoints',
  icon: 'fa fa-server',
  iconColor: '#563D7C',
  ownable: false,
  trigger: true,
  templates: {
  },
  hooks: {
    // service: {},
    // trigger: {}
  },
  events: [
    {
      name: 'called',
      humanName: 's-endpoint.events.called.name',
      viewerTitle: 's-endpoint.events.called.viewer.title',
      inputable: true,
      stepable: false,
      templates: {
        triggerEditor: 'triggerEditorEndpointEventNewContent'
      },
      callback: () => {}
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)