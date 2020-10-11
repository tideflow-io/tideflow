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
    updateForm: 'servicesAwsUpdateForm',
    help: 'servicesAwsHelp',
    helpIntro: 'servicesAwsHelpIntro',
  },
  hooks: {
    // service: {},
    // trigger: {}
  },
  events: [
    {
      name: 'iot-shadow-get',
      humanName: 's-aws.events.iot.shadow-get.name',
      viewerTitle: 's-aws.events.iot.shadow-get.title',
      inputable: false,
      stepable: true,
      callback: () => {},
      templates: {
        eventConfig: 'servicesAwsIotShadowGet'
      }
    },
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
    },
    {
      name: 'lambda-invoke',
      humanName: 's-aws.events.lambda.invoke.name',
      viewerTitle: 's-aws.events.lambda.invoke.title',
      inputable: false,
      stepable: true,
      callback: () => {},
      templates: {
        eventConfig: 'servicesAwsLambdaInvokeUpdate' // servicesAwsCommonConfig
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)