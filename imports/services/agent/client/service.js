import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'agent',
  humanName: 's-agent.name',
  description: 's-agent.description',
  website: 'https://tideflow.io/docs/services-agent',
  icon: 'fas fa-save',
  iconColor: '#3498DB',
  ownable: true,
  stepable: true,
  templates: {
    detailsView: 'servicesAgentDetailsView',
    createFormPre: 'servicesAgentCreateFormPre',
    updateFormPre: 'servicesAgentUpdateFormPre'
  },
  hooks: {
    // service: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'execute',
      humanName: 's-agent.events.command.name',
      viewerTitle: 's-agent.events.command.title',
      inputable: false,
      stepable: true,
      callback: () => {},
      templates: {
        eventConfig: 'servicesAgentExecuteConfig'
      },
    },
    /*{
      name: 'nodejs',
      humanName: 's-agent.events.nodejs.name',
      viewerTitle: 's-agent.events.nodejs.title',
      visibe: true,
      callback: () => {},
      templates: {
        eventConfig: 'servicesAgentNodejsConfig'
      },
    }*/
  ]
}

module.exports.service = service

servicesAvailable.push(service)