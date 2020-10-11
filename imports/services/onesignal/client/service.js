import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'onesignal',
  humanName: 's-onesignal.name',
  description: 's-onesignal.description',
  icon: 'fab fa-onesignal',
  icon_image: 'onesignal/tiny_icon.png',
  iconColor: '#F8981D',
  ownable: true,
  stepable: true,
  templates: {
    createForm: 'servicesOnesignalCreateForm',
    updateForm: 'servicesOnesignalUpdateForm',
    helpIntro: 'servicesOnesignalHelpIntro',
    help: 'servicesOnesignalHelp'
  },
  hooks: {
    // service: {},
    // trigger: {}
  },
  events: [
    {
      name: 'sendnotification',
      humanName: 's-onesignal.events.sendnotification.name',
      viewerTitle: 's-onesignal.events.sendnotification.title',
      inputable: false,
      stepable: true,
      callback: () => {},
      templates: {
        eventConfig: 'servicesOnesignalSend'
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)