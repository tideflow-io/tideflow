import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/client'

const service = {
  name: 'agent',
  humanName: 's-agent.name',
  description: 's-agent.description',
  website: 'https://www.tideflow.io/features/channels/agent/',
  icon: 'fas fa-save',
  iconColor: '#3498DB',
  inputable: false,
  stepable: true,
  ownable: true,
  templates: {
    detailsView: 'servicesAgentDetailsView',
    createMini: 'servicesAgentCreateMini',
    createFormPre: 'servicesAgentCreateFormPre',
    updateFormPre: 'servicesAgentUpdateFormPre'
  },
  hooks: {
    // channel: {},
    // step: {},
    // trigger: {}
  },
  events: [
    {
      name: 'execute',
      humanName: 's-agent.events.command.name',
      viewerTitle: 's-agent.events.command.viewer.title',
      visibe: true,
      callback: () => {},
      templates: {
        eventConfig: 'servicesAgentExecuteConfig'
      },
      conditions: [
        // {}
      ]
    },
    /*{
      name: 'nodejs',
      humanName: 's-agent.events.nodejs.name',
      visibe: true,
      callback: () => {},
      templates: {
        eventConfig: 'servicesAgentNodejsConfig'
      },
      conditions: [
        // {}
      ]
    }*/
  ]
}

module.exports.service = service

servicesAvailable.push(service)