import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'aws',
  humanName: 's-aws.name',
  description: 's-aws.description',
  website: 'https://docs.tideflow.io/docs/services-aws',
  icon: 'fab fa-aws',
  iconColor: '#F8981D',
  ownable: true,
  stepable: true,
  templates: {
    createForm: 'servicesAwsCreateForm',
    updateForm: 'servicesAwsUpdateForm'
  },
  hooks: {
    // service: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'iot-shadow-update',
      humanName: 's-aws.events.iot.shadow-update.name',
      viewerTitle: 's-aws.events.iot.shadow-update.title',
      inputable: false,
      stepable: true,
      callback: () => {},
      templates: {
        eventConfig: 'servicesAwsIotShadowUpdate' // servicesAwsCommonConfig
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)