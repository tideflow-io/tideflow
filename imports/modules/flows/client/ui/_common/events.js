import { Session } from 'meteor/session'
import { Router } from 'meteor/iron:router'
import { Template } from 'meteor/templating'

import { Services } from '/imports/modules/services/both/collection'
import { Flows } from '/imports/modules/flows/both/collection'
import { servicesAvailable } from '/imports/services/_root/client'

import { analyze, buildFlow } from '/imports/modules/flows/both/flow'

/**
 * Step TYPE selector changed its value
 * 
 * @param {Number} index 
 * @param {String} type 
 */
const stepTypeSelectorChanged = (index, type) => {
  if (index === null) { return null }
  let selectedStepService = servicesAvailable.find(s => s.name === type)

  $(`[name="steps.${index}.type"]`).val(selectedStepService ? type : null)
  $(`[name="steps.${index}._id"]`).val(null)
  $(`[name="steps.${index}.event"]`).val(null)

  Session.set(`fe-step-${index}`, selectedStepService || null)
  Session.set(`fe-step-${index}-event`, null)
  //Session.set('fe-editMode', index)
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

  if (!selectedStepService) return
  let selectedStepEvent = (selectedStepService.events || []).find(e => e.name === type)
  
  $(`[name="steps.${index}.event"]`).val(type)
  Session.set(`fe-step-${index}-event`, selectedStepEvent || null)
}

Template.flowEditorStepAvailable.events({
  'click .card': async (event, template) => {
    const formId = $('#page-content-wrapper > form')[0].id
    const formSchema = AutoForm.getFormSchema(formId)
    AutoForm.arrayTracker.addOneToField(formId, 'steps', formSchema)
    setTimeout(() => {
      let selector = $('.flow-step:last .step-type-selector').last().val(template.data.name)
      let stepIndex = selector.data().step
      stepIndex = stepIndex ? parseInt(stepIndex) : null
      stepTypeSelectorChanged(stepIndex, template.data.name)
    }, 100)
  }
})

Template.flowEditor.events({
  'hidden.bs.modal .modal-step-editor': (event, template) => {
    Session.set('fe-editMode', undefined)
  },

  'click .card.flow-step-trigger': (event, template) => {
    $('#modal-trigger-editor').modal('show')
  },

  'click .edit-mode-enter > *, click .edit-mode-enter': (event, template) => {
    let element = $(event.target)

    if (!element.hasClass('edit-mode-enter')) {
      element = element.parent('.edit-mode-enter')
    }

    const stepIndex = element.data('step')
    if (typeof stepIndex === 'undefined') return
    Session.set('fe-editMode', stepIndex)
    $('#modal-task-editor').modal('show')
  },

  'input #flow-sidebar-step-search input': (event, template) => {
    var scope = event.target
    if (!scope.value || scope.value == '') {
      $('#flow-sidebar-steps .card').show()
      return
    }
  
    $('#flow-sidebar-steps .card').each(function(i, div) {
      var $div = $(div)
      $div.toggle($div.text().toLowerCase().indexOf(scope.value.toLowerCase()) > -1)
    })
  },

  'change [name="triggerSelector"]': (event, template) => {
    const selectedServiceDoc = Services.findOne({ _id: event.currentTarget.value })
    if (selectedServiceDoc) {
      Session.set('fe-triggerIdSelected', event.currentTarget.value)
    }
    else {
      Session.set('fe-triggerIdSelected', '')
      let selectedService = servicesAvailable.find(sa => sa.name === event.currentTarget.value)
      Session.set('fe-triggerTypeSelected', selectedService)
    }
  },

  'change [name="triggerEventSelector"]': (event, template) =>
    Session.set('fe-triggerEventSelected', event.currentTarget.value),

  'change .step-type-selector': function(event, template) {
    let stepIndex = event.currentTarget.dataset.step
    stepIndex = stepIndex ? parseInt(stepIndex) : null
    stepTypeSelectorChanged(stepIndex, event.currentTarget.value)
  },

  'click .autoform-remove-item': function(event, template) {
    const card = $(event.target).parent('.card')
    const step = card.attr('data-step')

    // Remove all inbound connections
    card.find('.connector-inbound').map(function() {
      jsPlumb.remove(this)
    })

    // Remove all outbound connections
    card.find('.connector-outbound').map(function() {
      jsPlumb.remove(this)
    })

    $('.flow-step-step').each(function() {
      const currentStepNumber = $( this ).attr('data-step')
      if (currentStepNumber > step) {
        const newStepNumber = currentStepNumber-1
        $( this ).attr('data-step', newStepNumber)
        $( '.connector-out', this ).attr('data-step', newStepNumber)
      }
    })
    Session.set('fe-editMode', undefined)
    $('#modal-task-editor').modal('hide')
  },

  'change .step-event-selector': function(event, template) {
    const newValue = event.currentTarget.value
    let stepIndex = event.currentTarget.dataset.step
    stepIndex = stepIndex ? parseInt(stepIndex) : null
    stepEventSelectorChanged(stepIndex, newValue)
  }
})

const createConnection = (from, outputs) => {
  const source = (outputs.reason || '').startsWith('condition') ? 
    `#flow-editor .card[data-step="${from}"] .connector-outbound.${outputs.reason}` :
    `#flow-editor .card[data-step="${from}"] .connector-outbound`

  jsPlumb.connect({
    source: $(source), 
    target: $(`#flow-editor .card[data-step="${outputs.stepIndex}"] .connector-inbound`),
    anchor: 'Continuous'
  })
}

const changed = (template) => {
  let formId = $('.flow-editor').attr('id')
  let flowFormDoc = AutoForm.getFormValues(formId).insertDoc

  let flow = buildFlow(flowFormDoc, true)
  let analysis = analyze(flow, null, true)

  template.isCircular.set(analysis.errors.isCircular)
  template.hasEmptyConditions.set(analysis.errors.hasEmptyConditions)
  template.hasConditionsNotMet.set(analysis.errors.hasConditionsNotMet)
}

/**
 * Initialize the JSPlumb logic to make the flow editor work
 * 
 * @param {object} flow Flow's doc - as from MongoDB
 */
const setJsPlumb = (flow, template) => {

  jsPlumb.ready(function() {
    // Prevent having multiple connections from the same source to the
    // same target
    jsPlumb.bind('connection',function(info, manualEvent){
      let con = info.connection
      let arr = jsPlumb.select({source:con.sourceId,target:con.targetId})
      if (arr.length > 1) jsPlumb.deleteConnection(con)
      if (manualEvent) {
        changed(template)
      }
    })

    jsPlumb.bind('connectionAborted', function(info) {
      changed(template)
    })

    jsPlumb.bind('connectionDetached', function(a,b,c) {
      setTimeout(function() {
        changed(template)
      }, 100)
    })

    jsPlumbUtil.logEnabled = false
    jsPlumb.setContainer($('#flow-editor'))

    jsPlumb.draggable($('.card.flow-step'), {
      containment: '#flow-editor'
    })

    // Setup target cards
    jsPlumb.makeTarget($('.connector-inbound'), {
      anchor: 'Continuous'
    })

    // Setup source cards
    jsPlumb.makeSource($('.connector-outbound'), {
      parent: '.card',
      anchor: 'Continuous'
    })
    
    // now and when they are created / added to the dom
    $('body').on('DOMNodeInserted', '.flow-step-step', function (event) {
      jsPlumb.draggable($(this), {
        containment: '#flow-editor'
      })

      // Setup target cards
      jsPlumb.makeTarget($(this).find('.connector-inbound'), {
        anchor: 'Continuous'
      })

      // Setup source cards
      jsPlumb.makeSource($(this).find('.connector-outbound'), {
        parent: '.card',
        anchor: 'Continuous'
      })
    })

    if (!flow) {
      $('#flow-editor .flow-step-trigger').css('left', 20)
      $('#flow-editor .flow-step-trigger').css('top', 20)
      return
    }

    $('#flow-editor .flow-step-trigger').css('left', flow.trigger.x)
    $('#flow-editor .flow-step-trigger').css('top', flow.trigger.y)

    // TODO (flow.steps.map not a function chrome 73.0.3683.103 (Build oficial win/10) (64 bits))
    for (let i = 0; i < flow.steps.length; i++) {
      let step = flow.steps[i]
      let index = i
      let stepCard = $(`#flow-editor .flow-step-step:eq(${index})`)
      stepCard.css('left', step.x)
      stepCard.css('top', step.y)
    }

    // Trigger connectors
    (flow.trigger.outputs || []).map(out => {
      createConnection('trigger', out)
    })

    // Trigger connectors
    flow.steps.map((step, index) => {
      step.outputs.map(out => {
        createConnection(index, out)
      })
    })

    jsPlumb.repaintEverything()

    let dragCheck = false

    $('#flow-editor .card').draggable({
      drag: function () {
        // On drag set that flag to true
        dragCheck = true
      },
      stop: function () {
        // On stop of dragging reset the flag back to false
        dragCheck = false
      }
    })

    // Then instead of using click use mouseup, and on mouseup only fire if the flag is set to false
    $('.card').bind('mouseup', function (event) {
      if ($(event.target).hasClass('delete')) return
      if (dragCheck === false) {
        $('#sidebar').removeClass('d-none')
        $('#sidebar-content').html($('.card-body .content', this).html())
      }
    })

    changed(template)
  })
}

Template.flowEditor.onCreated(function() {
  this.isCircular = new ReactiveVar(false)
  this.hasEmptyConditions = new ReactiveVar(false)
  this.hasConditionsNotMet = new ReactiveVar(false)
})

Template.flowEditor.onRendered(function() {
  const instance = this

  instance.flowEditorRendered = false
  
  Session.set('fe-triggerIdSelected', undefined)
  Session.set('fe-triggerEventSelected', undefined)
  Session.set('fe-stepSelected', undefined)
  Session.set('fe-editMode', undefined)
  $('#modal-task-editor').modal('hide')
  let initialized = false

  instance.autorun(function () {
    // The URL doesn't contains a flow _id, therefore, the user is viewing
    // the flow's editor to create a brand new flow
    if (!Router.current().params._id) {
      setJsPlumb(null, instance)
      stepTypeSelectorChanged(0, servicesAvailable.find(sa => !!sa.stepable).name)
      return
    }

    // Subscribe to the flow.
    let subscription = instance.subscribe('flows.single', {
      _id: Router.current().params._id,
      team: Router.current().params.teamId
    })

    // Whenever Meteor has subscriber to flows.single...
    if (subscription.ready()) {
      if (initialized) return
      initialized = true

      // Grab the flow we want to work with
      let flow = Flows.findOne({
        _id: Router.current().params._id
      })

      // Woops! Flow not found. Load the editor anyway
      if (!flow) {
        setJsPlumb(null, instance)
        return null
      }

      // Setup the selected trigger
      if (flow.trigger._id) {
        $('select[name="triggerSelector"]').val(flow.trigger._id).change()
        Session.set('fe-triggerIdSelected', flow.trigger._id)
      }

      if (flow.trigger.type) {
        let selectedService = servicesAvailable.find(sa => sa.name === flow.trigger.type)
        Session.set('fe-triggerTypeSelected', selectedService)
      }

      if (flow.trigger.event) {
        $('select[name="triggerEventSelector"]').val(flow.trigger.event).change()
        Session.set('fe-triggerEventSelected', flow.trigger.event)
      }

      // At this point, all has been setup.
      if (!instance.flowEditorRendered) {
        if (!Array.isArray(flow.steps) || !flow.steps.length) return

        flow.steps.map((step, index) => {
          $(`.step-type-selector.form-control[data-step="${index}"]`).val(step.type).change()
          $(`.step-event-selector.form-control[data-step="${index}"]`).val(step.type).change()
          stepTypeSelectorChanged(index, step.type)
          stepEventSelectorChanged(index, step.event)
        })

        window.setTimeout(() => {
          setJsPlumb(flow, instance)
          instance.flowEditorRendered = true
        }, 1000)

    
      }
    }
  })
})
