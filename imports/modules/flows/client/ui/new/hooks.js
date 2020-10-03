import { AutoForm } from 'meteor/aldeed:autoform'
import { Router } from 'meteor/iron:router'

AutoForm.addHooks(['insertFlowForm'], {
  before: {
    method: function (doc) {
      // Append outputs to each step
      (doc.steps||[]).map(s => s.outputs = [])

      // Get trigger position details
      const tc = $('#flow-editor .flow-step-trigger')
      
      if (!doc.trigger) {
        sAlert.error(i18n.__('flows.insert.error.noTrigger'))
        return false
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
        return i - offset
      }

      // Get steps connection details
      jsPlumb.getConnections().map((connection, index) => {
        const source = $(`#${connection.sourceId}`)
        const target = $(`#${connection.targetId}`)
        const fromTrigger = source.attr('data-step') === 'trigger'
        const targetIndex = Number(target.attr('data-step'))
        const sourceIndex = Number(source.attr('data-step'))
        const realTarget = realPosition(targetIndex)
        const realSource = realPosition(sourceIndex)

        if (fromTrigger) {
          doc.trigger.outputs.push({stepIndex:realTarget})
        }
        else {
          doc.steps[realSource].outputs.push({stepIndex:realTarget})
        }
      })

      return doc
    }
  },
  after: {
    method: (error, result) => {
      jsPlumb.ready(function() {
        jsPlumbUtil.logEnabled = false
        $('#flow-editor .card').remove()
        jsPlumb.deleteEveryConnection()
      })
      
      Router.go('flows.one', {
        _id: result._id,
        teamId: result.team
      })
    }
  }
})
