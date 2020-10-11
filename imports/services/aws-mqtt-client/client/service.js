import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'aws-mqtt-client',
  humanName: 's-aws-mqtt-client.name',
  description: 's-aws-mqtt-client.description',
  icon: 'fas fa-satellite-dish',
  iconColor: '#59105C',
  ownable: true,
  stepable: false,
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
      name: 'subscribe',
      humanName: 's-aws-mqtt-client.events.subscribe.name',
      viewerTitle: 's-aws-mqtt-client.events.subscribe.title',
      inputable: true,
      stepable: false,
      callback: () => {},
      templates: {
        triggerEditor: 'servicesAwsMqttClientSubscribe'
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)