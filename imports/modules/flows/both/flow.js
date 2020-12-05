import { intersects } from '/imports/helpers/both/arrays'

const callsTo = flow => {
  let c = {} //

  const trigger = flow.trigger || {}

  c['trigger'] = (trigger.outputs || []).map(out => out.stepIndex);

  (flow.steps || []).map((step, index) => {
    c[index] = step.outputs.map(out => out.stepIndex)
  });

  return c
}

module.exports.callsTo = callsTo

/**
 * Given a flow, return the list of tasks that don't have any preceding one.
 * 
 * For the flow:
 * +--------------------+
 * | +-------+          |
 * | |Trigger|------v   |
 * | +-------+     +-+  |
 * |               |1|  |
 * |    +-+        +-+  |
 * |    |0|---------^   |
 * |    +-+             |
 * +--------------------+
 * 
 * return [0]
 * 
 * @param {Object} flow 
 */
const guessStepsWithoutPreceding = (flow) => {
  // Build a list with all the steps indexes.
  // [0, 1]
  const allSteps = flow.steps.map((s,i)=>i)
  // List of steps indexes that are connected to the trigger
  // The result is [1]
  let triggerNextSteps = flow.trigger.outputs.map(o => o.stepIndex)

  // The result is [0]
  flow.steps.map((step, index) => {
    triggerNextSteps = triggerNextSteps.concat( (step.outputs || []).filter(s => s.stepIndex !== index).map(s => s.stepIndex) )
  })

  // The result is [ [0,1], [1] ]
  const lists = [allSteps, triggerNextSteps]
  // The result is [ 0 ]
  const cardsWithoutInbound = lists.reduce((a, b) => a.filter(c => !b.includes(c)))
  return cardsWithoutInbound || []
}

module.exports.guessStepsWithoutPreceding = guessStepsWithoutPreceding

/**
 * Returns the list steps indexes each step is called from.
 * 
 * +----------------------------+
 * | +-------+      +-+     +-+ |
 * | |Trigger|----->|0|  +->|4| |
 * | +-------+      +++  |  +-+ |
 * |                 |   |   ^  |
 * |                 v   |   |  |
 * |       +-+      +-   |  +-+ |
 * |       |2|----->|1|--+->|3| |
 * |       +-+      +-+     +-+ |
 * +----------------------------+
 * 
 * An example output is: 
 * 
 * {
 *  0: ['trigger']    // Step is 0 is called from the trigger
 *  1: [0, 2],        // Step 1 is called from 0 and 2
 *  3: [1],           // Step 3 is called from 1
 *  4: [1, 3]         // Step 4 is called from 1 and 3
 * }
 * 
 * The previous result example is for a flow like this:
 * 
 * {
 *  "trigger" : { "outputs" : [  { "stepIndex" : 0 } ] },
 *  "steps" : [
 *   { "outputs" : [ { "stepIndex" : 1 } ] },
 *   { "outputs" : [ { "stepIndex" : 3 }, { "stepIndex" : 4 } ] },
 *   { "outputs" : [ { "stepIndex" : 1 } ] },
 *   { "outputs" : [ { "stepIndex" : 4 } ] }
 *  ]
 * }
 * 
 * @param {*} flow 
 */
const calledFrom = flow => {
  let c = {} //

  const processOutputs = (outputs, index) => {
    (outputs || []).map(output => {
      let outputId = output.stepIndex
      if (!c[outputId]) c[outputId] = []
      c[outputId].push(index)
    })
  }

  flow.steps.map((step, index) => processOutputs(step.outputs, index))
  processOutputs(flow.trigger.outputs, 'trigger')

  return c
}

module.exports.calledFrom = calledFrom

const isCircular = flow => {
  let result = false
  const thisCallsto = callsTo(flow)
  const path = (list, next) => {
    if (intersects(list, next)) {
      result = true
      return;
    }
    return next.map(n => path(list.concat(n), thisCallsto[n]))
  }

  const triggerCalls = thisCallsto.trigger

  if (triggerCalls.length) {
    path(['tigger'], triggerCalls)
  }
  else {
    let noPreceding = guessStepsWithoutPreceding(flow)
    noPreceding.map(np => {
      path([np], thisCallsto[np])
    })
  }

  return result
}

module.exports.isCircular = isCircular

const analyze = (flow) => {
  let constainsConditions = !!flow.steps.filter(s => s.type === 'conditions').length
  const thisCallsto = callsTo(flow)

  const path = (list, next) => {
    if (intersects(list, next)) throw 'circular'
    return next.map(n => path(list.concat(n), thisCallsto[n]))
  }

  if (thisCallsto.trigger) {
    path(['tigger'], thisCallsto.trigger)
  }

  let executionSteps = 'unknown' // Here is where your magic happens :)

  return {
    steps: flow.steps.length,
    executionSteps: constainsConditions ? executionSteps : flow.steps.length
  }
}

module.exports.analyze = analyze

/**
 * 
 * @param {Object} doc Original object from autoform
 * @param {boolean} skipErrors 
 */
const buildFlow = (doc, skipErrors) => {
  // Append outputs to each step
  (doc.steps||[]).map(s => s.outputs = [])

  // Get trigger position details
  const tc = $('#flow-editor .flow-step-trigger')

  if (!doc.trigger) {
    if (skipErrors) {
      doc.trigger = {}
    }
    else {
      throw new Error('flows.insert.error.noTrigger')
    }
  }

  doc.trigger.x = parseInt(tc.css('left'), 10)
  doc.trigger.y = parseInt(tc.css('top'), 10)
  doc.trigger.outputs = []

  // Get steps position details
  const stepCards = $('#flow-editor .flow-step-step')
  stepCards.map((index, card) => {
    doc.steps[index].x = parseInt($(card).css('left'), 10)
    doc.steps[index].y = parseInt($(card).css('top'), 10)
  })

  let realPosition = (i) => {
    let offset = count = 0
    while(count < $(`.flow-step-step`).length) {
      if (!$(`.flow-step-step[data-step="${count}"]`).length) {
        offset++
      }
      count++
    }
    return (i - offset) > 0 ? (i - offset) : 0
  }

  // Get steps connection details
  jsPlumb.getConnections().map((connection, index) => {
    const source = $(`#${connection.sourceId}`)
    const target = $(`#${connection.targetId}`)
    
    const fromTrigger = source.attr('data-step') === 'trigger'
    const targetIndex = Number(target.attr('data-step'))
    const sourceIndex = Number(source.attr('data-step'))
    const sourceCondition = source.attr('data-condition')
    const realTarget = realPosition(targetIndex)
    const realSource = realPosition(sourceIndex)

    if (fromTrigger) {
      doc.trigger.outputs.push({
        stepIndex: realTarget
      })
    }
    else {
      doc.steps[realSource].outputs.push({
        reason: sourceCondition ? `condition-${sourceCondition}` : 'step',
        stepIndex: realTarget
      })
    }
  })

  return doc
}

module.exports.buildFlow = buildFlow