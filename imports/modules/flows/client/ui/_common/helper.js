import { Session } from 'meteor/session'
import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import i18n from 'meteor/universe:i18n'

import { Flows } from '/imports/modules/flows/both/collection.js'
import { Services } from '/imports/modules/services/both/collection.js'
import { servicesAvailable } from '/imports/services/_root/client'
import { checkRole } from '/imports/helpers/both/roles'

// The native sort modifies the array in place. `_.orderBy` and `_.sortBy` do not, so we use `.concat()` to
// copy the array, then sort.
const sortBy = (key) => {
  return (a, b) => (a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0)
}

Template.registerHelper('flowViewerTriggerTitle', function() {
  try {
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

Template.registerHelper('flowViewerStepTitle', function() {
  try {
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

Template.registerHelper('absoluteUrl', () => Meteor.absoluteUrl())
Template.registerHelper('checkUserRole', (team) => {
  return checkRole(Meteor.userId(), team)
})

Template.registerHelper('isInUrl', url => {
  if (!url) return null
  if (!Router.current().route.path()) return null
  return Router.current().route.path().indexOf(url) === 1
})

Template.registerHelper('routeIs', routeName => Router.current().route.getName() === routeName)
Template.registerHelper('routeContains', routeName => Router.current().route.getName().indexOf(routeName) >= 0)

Template.registerHelper('triggerConfigValue', function(setting) {
  if (!this || !this.flow || !this.flow.trigger || !this.flow.trigger.config) return
  return this.flow.trigger.config[setting] ? this.flow.trigger.config[setting] : null
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

Template.registerHelper('stepConfigValueChecked', function(setting) {
  if (!this || !this.steps || !this.steps[this.index]) return
  const s = this.steps[this.index].config ? this.steps[this.index].config[setting] || '' : ''
  return s ? 'checked' : ''
})

Template.registerHelper('stepConfigName', function(setting) {
  return `steps.${this.index}.config.${setting}`
})

Template.registerHelper('triggerConfigName', function(setting) {
  return `trigger.config.${setting}`
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

Template.flowEditor.helpers({

  editMode: function() {
    return Session.get('fe-editMode') === this.index
  },

  cardText: function() {
    const getFromDoc = () => {
      const flow = Flows.findOne({})
      if (!flow || !this.index) return null
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

  cardTitle: function() {
    const selectedService = Session.get(`fe-step-${this.index}`)
    return selectedService ? `${i18n.__(selectedService.humanName)}` : null
  },

  cardIcon: function() {
    const selectedService = Session.get(`fe-step-${this.index}`)
    return selectedService ? selectedService.icon : null
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
  triggerTypeSelected: () => Session.get('fe-triggerTypeSelected'),
  triggerIdSelected: () => Session.get('fe-triggerIdSelected'),
  triggerEventSelected: () => Session.get('fe-triggerEventSelected'),
  triggerSelected: () => {
    const _id = Session.get('fe-triggerIdSelected')
    if (!_id) {
      const type = Session.get('fe-triggerTypeSelected')
      if (!type) return null
      let selectedService = servicesAvailable.find(sa => sa.name === type)
      if (!selectedService) return null
      return selectedService
    }

    const selectedServiceDoc = Services.findOne({ _id })
    let selectedService = servicesAvailable.find(sa => sa.name === selectedServiceDoc.type)
    
    if (!selectedService) return null
    Session.set('fe-triggerTypeSelected', selectedService.name)
    return selectedService
  },

  isSelectedTrigger(d, t) {
    const compareTo = Session.get('fe-triggerIdSelected') || Session.get('fe-triggerTypeSelected')
    const selected = this._id === compareTo
    return selected ? 'selected' : ''
  },

  isSelectedTriggerEvent(d, t) {
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
      const sa = servicesAvailable.find(s => s.name === typeSelected)
      const e = sa.events.find(event => event.name === eventSelected)
      return e.templates.triggerEditor
    }
    catch (ex) {
      return null
    }
  }
})
