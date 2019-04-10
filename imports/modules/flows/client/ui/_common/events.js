import { Router } from 'meteor/iron:router'
import { Template } from 'meteor/templating'

import { Services } from '/imports/modules/services/both/collection.js'
import { Flows } from '/imports/modules/flows/both/collection.js'
import { servicesAvailable } from '/imports/services/_root/client'

/**
 * Step TYPE selector changed its value
 * 
 * @param {*} index 
 * @param {*} type 
 */
const stepTypeSelectorChanged = (index, type) => {
  if (index === null) { return null }
  let selectedStepService = servicesAvailable.find(s => s.name === type)

  $(`[name="steps.${index}.type"]`).val(selectedStepService ? type : null)
  $(`[name="steps.${index}._id"]`).val(null)
  $(`[name="steps.${index}.event"]`).val(null)

  Session.set(`fe-step-${index}`, selectedStepService || null)
  Session.set(`fe-step-${index}-event`, null)
}

/**
 * Step EVENT selector changed its value
 * 
 * @param {*} index 
 * @param {*} type 
 */
const stepEventSelectorChanged = function(index, type) {
  if (index === null) { return null }
  let selectedStepService = Session.get(`fe-step-${index}`)
  let selectedStepEvent = (selectedStepService.events || []).find(e => e.name === type)

  $(`[name="steps.${index}.event"]`).val(selectedStepService ? type : null)
  Session.set(`fe-step-${index}-event`, selectedStepEvent || null)
}

Template.flowEditor.events({
  'change [name="triggerSelector"]': (event, template) => {
    const selectedServiceDoc = Services.findOne({ _id: event.currentTarget.value })
    if (selectedServiceDoc) {
      Session.set('fe-triggerIdSelected', event.currentTarget.value)
    }
    else {
      Session.set('fe-triggerIdSelected', '')
      Session.set('fe-triggerTypeSelected', event.currentTarget.value)
    }
  },

  'change [name="triggerEventSelector"]': (event, template) =>
    Session.set('fe-triggerEventSelected', event.currentTarget.value),

  'change .step-type-selector': function(event, template) {
    let stepIndex = event.currentTarget.dataset.step
    stepIndex = stepIndex ? parseInt(stepIndex) : null
    stepTypeSelectorChanged(stepIndex, event.currentTarget.value)
  },

  'change .step-event-selector': function(event, template) {
    const newValue = event.currentTarget.value
    let stepIndex = event.currentTarget.dataset.step
    stepIndex = stepIndex = stepIndex ? parseInt(stepIndex) : null
    stepEventSelectorChanged(stepIndex, newValue)
  }
})

Template.flowEditor.onRendered(function() {
  const instance = this

  instance.__flowEditorRendered = false

  jsPlumb.getInstance({
    Container: '#flow-editor'
  })

  Session.set('fe-triggerIdSelected', '')
  Session.set('fe-triggerEventSelected', '')
  Session.set('fe-stepSelected', '')

  instance.autorun(function () {
    if (!Router.current().params._id) {
      return
    }
    let subscription = instance.subscribe('flows.single', {
      _id: Router.current().params._id
    })

    if (subscription.ready()) {

      let flow = Flows.findOne({
        _id: Router.current().params._id
      })
      if (!flow) return null

      if (flow.trigger._id) {
        $('select[name="triggerSelector"]').val(flow.trigger._id).change()
        Session.set('fe-triggerIdSelected', flow.trigger._id)
      }

      if (flow.trigger.type) {
        Session.set('fe-triggerTypeSelected', flow.trigger.type)
      }

      if (flow.trigger.event) {
        $('select[name="triggerEventSelector"]').val(flow.trigger.event).change()
        Session.set('fe-triggerEventSelected', flow.trigger.event)
      }

      if (!instance.__flowEditorRendered) {
        jsPlumb.draggable($('.flow-step'), {
          containment: '#flow-editor'
        })

        jsPlumb.bind('connection',function(info){
          let con = info.connection
          let arr = jsPlumb.select({source:con.sourceId,target:con.targetId})
          if (arr.length>1) jsPlumb.deleteConnection(con)
        })

        jsPlumb.makeSource($('.connector-out.connector-outbound'), {
          parent: '.card',
          anchor: 'Continuous'
        })

        jsPlumb.makeTarget($('.connector-out.connector-inbound'), {
          parent: '.card',
          anchor: 'Continuous'
        })
        
        if (!Array.isArray(flow.steps) || !flow.steps.length) return

        flow.steps.map((step, index) => {
          $(`.step-type-selector.form-control[data-step="${index}"]`).val(step.type).change()
          $(`.step-event-selector.form-control[data-step="${index}"]`).val(step.type).change()
          stepTypeSelectorChanged(index, step.type)
          stepEventSelectorChanged(index, step.event)
        })
        instance.__flowEditorRendered = true
      }
    }
  })
})