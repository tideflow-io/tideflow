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
        eventConfig: 'servicesAgentCommonConfig'
      }
    },
    {
      name: 'code_nodesfc',
      humanName: 's-agent.events.code_nodesfc.name',
      viewerTitle: 's-agent.events.code_nodesfc.title',
      inputable: false,
      stepable: true,
      callback: () => {},
      templates: {
        eventConfig: 'servicesAgentCommonConfig'
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)