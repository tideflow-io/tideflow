import { AutoForm } from 'meteor/aldeed:autoform'
import { Router } from 'meteor/iron:router'

AutoForm.addHooks(['updateFlowForm'], {
  before: {
    method: function (doc) {
      // Append outputs to each step
      doc.steps.map(s => s.outputs = [])

      // Get trigger position details
      const tc = $('#flow-editor .flow-step-trigger')
      doc.trigger.x = parseInt(tc.css('left'), 10)
      doc.trigger.y = parseInt(tc.css('top'), 10)
      doc.trigger.outputs = []

      // Get steps position details
      const stepCards = $('#flow-editor .flow-step-step')
      stepCards.map((index, card) => {
        doc.steps[index].x = parseInt($(card).css('left'), 10)
        doc.steps[index].y = parseInt($(card).css('top'), 10)
      })

      // Get steps connection details
      jsPlumb.getConnections().map((connection, index) => {
        const source = $(`#${connection.sourceId}`)
        const target = $(`#${connection.targetId}`)
        const fromTrigger = source.data('step') === 'trigger'
        const targetIndex = Number(target.data('step'))
        const sourceIndex = Number(source.data('step'))

        console.log({
          connection,
          index,
          source,
          target,
          fromTrigger,
          targetIndex, 
          sourceIndex
        })

        if (fromTrigger) {
          doc.trigger.outputs.push({stepIndex:targetIndex})
        }
        else {
          doc.steps[sourceIndex].outputs.push({stepIndex:targetIndex})
        }
      })

      return doc
    }
  },
  after: {
    method: (error, result) => {

      jsPlumb.ready(function() {
        $('#flow-editor .card').remove()
        jsPlumb.deleteEveryConnection()
      })

      Router.go('flows.one', result)
    }
  }
})
