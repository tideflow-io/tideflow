import { Router } from 'meteor/iron:router'
import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { sAlert } from 'meteor/juliancwirko:s-alert'
import i18n from 'meteor/universe:i18n'
import { ReactiveVar } from 'meteor/reactive-var'

Template['flows.one'].onCreated(function() {
  let self = this
  
  this.executions = new ReactiveVar([])
  this.executionsLoaded = new ReactiveVar(false)

  this.autorun(function () {
    self.executions.set([])
    self.executionsLoaded.set(false)
    Meteor.call('flows.one.executions', {
      flow: Router.current().params._id
    }, (error, result) => {
      if (!error) {
        self.executions.set(result.length ? result[0] : {result:[]})
      }
      self.executionsLoaded.set(true)
    })
  })

})

Template['flows.one'].events({
  'click .flow-editor-link': (event) => {
    event.stopPropagation()
    document.location.reload(true)
  },
  'change #updateFlowStatus select[name="status"]': (event, tpl) => {
    tpl.data.flow.status = event.target.value
    Meteor.call('flows.update', tpl.data.flow, (error, result) => {
      if (error) {
        sAlert.error(i18n.__('flows.status.update.error'))
        return
      }
      sAlert.success(i18n.__('flows.status.update.success'))
    })
  },
  'click .flows-one-delete': (event, template) => {
    event.preventDefault()
    event.stopPropagation()

    swal({
      title: i18n.__('flows.delete.title'),
      text: i18n.__('flows.delete.text'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      animation: false
    })
      .then(accepted => {
        if (accepted) {
          Meteor.call('flows.delete', {
            _id: template.data.flow._id
          }, (error) => {
            if (error) {
              sAlert.error(i18n.__('flows.delete.error'))
              return
            }
            sAlert.success(i18n.__('flows.delete.success'))
            Router.go('flows.index')
          })
        }
      })
  }
})

Template.flowOneExecutionSmallCardsHorizontal.events({
  'click': (event, template) => {
    Router.go('flowsOneExecutions', {
      _id: template.data.executions._id
    })
  }
})