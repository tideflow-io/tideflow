import { Router } from 'meteor/iron:router'
import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { sAlert } from 'meteor/juliancwirko:s-alert'
import i18n from 'meteor/universe:i18n'
import { ReactiveVar } from 'meteor/reactive-var'

import { ExecutionsStats } from '/imports/modules/executions/client/collection'

Template['flows.one'].onCreated(function() {
  let self = this
  
  this.executions = new ReactiveVar([])

  this.autorun(function () {
    self.executions.set([])

    self.subscribe('flows.one.executionsStats', {
      flow: Router.current().params._id
    })
  })
})

Template['flows.one'].helpers({
  'executions': function () {
    let e = ExecutionsStats.find().fetch()
      return e && e[0] ? e[0] : {}
  }
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