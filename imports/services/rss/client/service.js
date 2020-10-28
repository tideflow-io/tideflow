import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'rss',
  icon: 'fa fa-rss',
  iconColor: '#FFA200',
  humanName: 's-rss.name',
  description: 's-rss.description',
  ownable: false,
  trigger: true,
  templates: {
    triggerHelp: 'triggerRSSHelp',
    triggerHelpIntro: 'triggerRSSHelpIntro',
    detailsView: 'servicesRssDetailsView',
    createForm: 'servicesRssCreateForm',
    createFormPre: 'servicesRssCreateFormPre',
    updateForm: 'servicesRssUpdateForm',
    updateFormPre: 'servicesRssUpdateFormPre'
  },
  hooks: {
    // service: {},
    // trigger: {}
  },
  events: [
    {
      name: 'new-content',
      humanName: 's-rss.events.new-content.name',
      viewerTitle: 's-rss.events.new-content.viewer.title',
      inputable: true,
      stepable: false,
      templates: {
        triggerEditor: 'triggerEditorRssEventNewContent'
      },
      callback: () => {}
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)