import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'aws-mqtt-client',
  humanName: 's-aws-mqtt-client.name',
  description: 's-aws-mqtt-client.description',
  website: 'https://docs.tideflow.io/docs/services-aws-mqtt-client',
  icon: 'fas fa-satellite-dish',
  iconColor: '#59105C',
  ownable: true,
  stepable: true,
  templates: {
    createForm: 'servicesAwsMqttClientCreateForm',
    updateForm: 'servicesAwsMqttClientUpdateForm'
  },
  hooks: {
    // service: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'message',
      humanName: 's-aws-mqtt-client.events.message.name',
      viewerTitle: 's-aws-mqtt-client.events.message.title',
      inputable: true,
      stepable: false,
      callback: () => {},
      templates: {
        triggerEditor: 'servicesAwsMqttClientMessage'
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)