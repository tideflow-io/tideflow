import { Session } from 'meteor/session'
import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import i18n from 'meteor/universe:i18n'

import { Flows } from '/imports/modules/flows/both/collection'
import { Services } from '/imports/modules/services/both/collection'
import { servicesAvailable } from '/imports/services/_root/client'

/**
 * Sorts an array of objects by the specified property.
 * 
 * The native sort javascript function modifies the array in place, so we use 
 * `.concat()` to copy the array, and then apply this sortBy function
 * 
 * @param {string} key property to sort by
 * 
 * Usage example:
 * 
 * [
 *   { title: 'c' },
 *   { title: 'b' },
 *   { title: 'a' }
 * ].concat().sort(sortBy('title'))
 */
const sortBy = (key) => {
  return (a, b) => (a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0)
}

Template.registerHelper('flowViewerTriggerTitle', function() {
  try {
    if (!this.type || !this.event) {
      return i18n.__('flows.one.viewer.triggerNotDefined')
    }
    return i18n.__(
      servicesAvailable
        .find(sa => sa.name === this.type).events.find(e => e.name === this.event).viewerTitle
    )
  } catch (ex) {
    return null
  }
})

Template.registerHelper('flowDoc', function(_id, property) {
  let r = Flows.findOne({ _id })
  return r ? property ? r[property] : r : null
})

Template.registerHelper('flowExecutions', function(results, status, percent) {
  if (!results) return 0;
  let total = 0; results.map(r => total += r.count)

  if (status === 'total') {
    return total
  }

  let result = results.find(r => r.status === status)
  if (!percent) return result ? result.count : 0

  if (!result) return 0
  return +(Math.round(((result.count/total)*100) + 'e+2')  + 'e-2')
})

Template.registerHelper('flowViewerStepTitle', function() {
  try {
    if (!this.type || !this.event) {
      return i18n.__('flows.one.viewer.stepNotDefined')
    }
    return i18n.__(
      servicesAvailable
        .find(sa => sa.name === this.type).events.find(e => e.name === this.event).viewerTitle,
      this.config
    )
  } catch(ex) {}
})

Template.registerHelper('serviceProperty', (name, property) => {
  if (!name) return null
  try {
    return servicesAvailable.find(sa => sa.name === name)[property]
  } catch (ex) {
    return null
  }
})

Template.registerHelper('serviceHumanName', (name) => {
  if (!name) return null
  try {
    return i18n.__(servicesAvailable.find(sa => sa.name === name).humanName)
  } catch (ex) {
    return null
  }
})

Template.registerHelper('serviceHumanPluralName', (name) => {
  if (!name) return null
  try {
    return i18n.__(servicesAvailable.find(sa => sa.name === name).pluralName)
  } catch (ex) {
    return null
  }
})

Template.registerHelper('eventHumanName', (serviceName, eventName) => {
  if (!serviceName) return null
  if (!eventName) return null
  try {
    return i18n.__(
      servicesAvailable.find(sa => sa.name === serviceName).events.find(e => e.name === eventName).humanName
    )
  } catch (ex) {
    return null
  }
})

Template.registerHelper('triggerConfigValue', function(setting) {
  if (!this || !this.flow || !this.flow.trigger || !this.flow.trigger.config) return
  return this.flow.trigger.config[setting] ? this.flow.trigger.config[setting] : null
})

Template.registerHelper('stepPropertyValue', function(property, defaultValue) {
  if (!this || !this.steps || !this.steps[this.index]) {
    return typeof defaultValue === 'object' ? null : defaultValue || ''
  }
  if (!defaultValue) defaultValue = ''
  return this.steps[this.index] ? this.steps[this.index][property] || defaultValue : defaultValue
})

Template.registerHelper('stepProperty', function(setting) {
  return `steps.${this.index}.${setting}`
})

Template.registerHelper('stepConfigValue', function(setting, defaultValue) {
  if (!this || !this.steps || !this.steps[this.index]) {
    return typeof defaultValue === 'object' ? null : defaultValue || ''
  }
  if (!defaultValue) defaultValue = ''
  return this.steps[this.index].config ? this.steps[this.index].config[setting] || defaultValue : defaultValue
})

Template.registerHelper('stepConfigValueSelected', function(setting, compare) {
  if (!this || !this.steps || !this.steps[this.index]) return
  const s = this.steps[this.index].config ? this.steps[this.index].config[setting] || '' : ''
  return s === compare ? 'selected' : ''
})

Template.registerHelper('selectedVal', function(value) {
  return value ? 'selected' : ''
})

Template.registerHelper('stepConfigValueSelectedEach', function(steps, index, setting, compare) {
  if (!steps || !steps[index]) return
  const s = steps[index].config ? steps[index].config[setting] || '' : ''
  return s === compare ? 'selected' : ''
})

Template.registerHelper('triggerConfigValueSelectedEach', function(trigger, setting, compare) {
  if (!trigger) return
  const s = trigger.config ? trigger.config[setting] || '' : ''
  return s === compare ? 'selected' : ''
})

Template.registerHelper('triggerConfigValueSelected', function(setting, compare) {
  if (!this.flow || !this.flow.trigger || !this.flow.trigger.config) return
  return this.flow.trigger.config[setting] === compare ? 'selected' : ''
})

Template.registerHelper('stepConfigValueEqChecked', function(setting, compareTo, defaults) {
  if (!this || !this.steps) return;

  if (!this.steps[this.index]) {
    return defaults ? 'checked' : ''
  }

  const s = this.steps[this.index].config ? this.steps[this.index].config[setting] || '' : ''
  return s === compareTo ? 'checked' : ''
})

Template.registerHelper('stepConfigValueIsChecked', function(setting, compareTo) {
  if (!this || !this.steps || !this.steps[this.index]) return;
  const s = this.steps[this.index].config ? this.steps[this.index].config[setting] || '' : ''
  return s === compareTo
})

Template.registerHelper('stepConfigName', function(setting) {
  return `steps.${this.index}.config.${setting}`
})

Template.registerHelper('triggerConfigName', function(setting) {
  return `trigger.config.${setting}`
})

Template.triggerHelp.helpers({
  triggerHelpTpl() {
    let service = Session.get(`fe-triggerTypeSelected`)
    if (!service || !service.templates) return false
    return service.templates.triggerHelp || false
  },
  
  triggerHelpIntroTpl() {
    let service = Session.get(`fe-triggerTypeSelected`)
    if (!service || !service.templates) return false
    return service.templates.triggerHelpIntro || false
  },

  triggerTaskHelpTpl() {
    const event = Session.get(`fe-triggerEventSelected`)
    if (!event || !event.templates) return false
    return event.templates.help
  }
})

Template.taskHelp.helpers({
  taskHelpTpl() {
    let service = Session.get(`fe-step-${this.index}`)
    if (!service || !service.templates) return false
    return service.templates.help || false
  },
  
  taskHelpIntroTpl() {
    let service = Session.get(`fe-step-${this.index}`)
    if (!service || !service.templates) return false
    return service.templates.helpIntro || false
  },

  serviceTaskHelpTpl() {
    const event = Session.get(`fe-step-${this.index}-event`)
    if (!event || !event.templates) return false
    return event.templates.help
  }
})

Template.stepEventConfig.helpers({
  service() {
    return Session.get(`fe-step-${this.index}`)
  },
  event() {
    const event = Session.get(`fe-step-${this.index}-event`)
    if (event && event.stepConfig && event.stepConfig.data) {
      event.stepConfig.data.map((d) => {
        d.name = `steps.${this.index}.config.${d.name}`
      })
    }
    return event
  }
})

Template.flowEditorOutputs.helpers({
  stepOutputsTemplate: function() {
    const { step } = this
    try {
      const selectedService = Session.get(`fe-step-${step.index}`)
      return selectedService.templates.outputs
    } catch (ex) {
      return null
    }
  }
})

Template.flowEditor.helpers({
  isCircular: function() {
    return Template.instance().isCircular.get();
  },

  hasEmptyConditions: function() {
    return Template.instance().hasEmptyConditions.get();
  },

  hasConditionsNotMet: function() {
    return Template.instance().hasConditionsNotMet.get();
  },

  editMode: function() {
    return Session.get('fe-editMode') === this.index
  },

  stepCardTitle: function() {
    const selectedService = Session.get(`fe-step-${this.index}`)
    return selectedService ? `${i18n.__(selectedService.humanName)}` : null
  },

  stepCardText: function(context) {
    const getFromDoc = () => {
      const flow = context.hash.flow
      if (!flow || !this.index || !flow.steps) return null
      const docStep = flow.steps[this.index]
      return docStep ? docStep.event : null
    }

    const selectedService = Session.get(`fe-step-${this.index}`)
    if (!selectedService) return;
    let selectedEventVal = $(`[name="steps.${this.index}.event"]`).val()
    if (!selectedEventVal) selectedEventVal = getFromDoc()
    if (!selectedEventVal) return i18n.__('flows.editor.trigger.notSet')
    const selectedEvent = selectedService.events.find(e => e.name === selectedEventVal)
    return selectedEvent ? i18n.__(selectedEvent.humanName) : i18n.__('flows.editor.trigger.notSet')
  },

  triggerCardTitle: function() {
    const selectedService = Session.get('fe-triggerTypeSelected')
    if (!selectedService) return i18n.__('flows.editor.trigger.title')
    return i18n.__(selectedService.humanName)
  },

  triggerCardText: function() {
    const selectedService = Session.get('fe-triggerTypeSelected')
    const selectedEventVal = Session.get('fe-triggerEventSelected')
    if (!selectedService || !selectedEventVal) return null
    const selectedEvent = selectedService.events.find(e => e.name === selectedEventVal)
    return selectedEvent ? i18n.__(selectedEvent.humanName) : i18n.__('flows.editor.trigger.notSet')
  },

  cardIcon: function() {
    const selectedService = Session.get(`fe-step-${this.index}`)
    return selectedService ? selectedService.icon : null
  },

  cardIconImage: function() {
    const selectedService = Session.get(`fe-step-${this.index}`)
    return selectedService ? selectedService.icon_image : null
  },

  cardIconColor: function() {
    const selectedService = Session.get(`fe-step-${this.index}`)
    if (!selectedService) return;
    return selectedService.iconColor
  },

  stepSelectedEvents() {
    const selectedService = Session.get(`fe-step-${this.index}`)
    return selectedService ? selectedService.events.filter(e => e.stepable) || false : false
  },
  isSelectedStepType: (flow, index, current) => {
    if (!flow || !flow.steps || !flow.steps[index]) return ''
    return flow.steps[index].type === current ? 'selected' : ''
  },
  isSelectedEventsEvent: (flow, index, current) => {
    if (!flow || !flow.steps || !flow.steps[index]) return ''

    const match = flow.steps[index].event === current

    if (match) {
      const service = Session.get(`fe-step-${index}`)
      const event = service.events.find(e => e.name === current)
      Session.set(`step-${index}-event`, event || null)
    }

    return match ? 'selected' : ''
  },
  triggers: () => {
    let chs = []
    servicesAvailable.filter(sa => {
      return !sa.ownable && sa.events.find(e => e.inputable)
    }).map(s => {
      chs.push({
        _id: s.name,
        title: `${i18n.__(s.humanName)} ${s.description ? `- ${i18n.__(s.description)}` : ''}`
      })
    })

    Services.find().map((c) => {
      let sa = servicesAvailable.find(s => s.name === c.type)
      if (!sa.events.find(e => e.inputable)) return;
      chs.push({
        _id: c._id,
        title: `${i18n.__(sa.humanName)} : ${c.title}`
      })
    })

    return chs.concat().sort(sortBy('title'))
  },

  triggerTypeSelected: () => {
    let selectedService = Session.get('fe-triggerTypeSelected')
    if (!selectedService) return null
    return selectedService.name
  },
  triggerIdSelected: () => Session.get('fe-triggerIdSelected'),
  triggerEventSelected: () => Session.get('fe-triggerEventSelected'),

  triggerSelected: () => {
    const _id = Session.get('fe-triggerIdSelected')
    if (!_id) {
      let selectedService = Session.get('fe-triggerTypeSelected')
      if (!selectedService) return null
      return selectedService
    }

    const selectedServiceDoc = Services.findOne({ _id })
    let selectedService = servicesAvailable.find(sa => sa.name === selectedServiceDoc.type)
    
    if (!selectedService) return null
    Session.set('fe-triggerTypeSelected', selectedService)
    return selectedService
  },

  isSelectedTrigger() {
    const compareTo = Session.get('fe-triggerTypeSelected')
    if (!compareTo) return ''
    const selected = this._id === compareTo.name
    return selected ? 'selected' : ''
  },

  isSelectedTriggerEvent() {
    const selected = this.name === Session.get('fe-triggerEventSelected')
    return selected ? 'selected' : ''
  },

  stepsAvailable() {
    return servicesAvailable.filter(sa => {
      return sa.events.find(e => e.step)
    })
  },

  stepsAvailableSidebar() {
    return servicesAvailable.filter(sa => {
      return !!sa.stepable
    })
  },

  triggerEditorEventForm: function() {
    const typeSelected = Session.get('fe-triggerTypeSelected')
    const eventSelected = Session.get('fe-triggerEventSelected')
    try {
      const e = typeSelected.events.find(event => event.name === eventSelected)
      return e.templates.triggerEditor
    }
    catch (ex) {
      return null
    }
  }
})
