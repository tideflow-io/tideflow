import { Template } from 'meteor/templating'
import { Router } from 'meteor/iron:router'
import { Meteor } from 'meteor/meteor'

import i18n from 'meteor/universe:i18n'

Template.servicesDatatableDetailsView.onRendered(function() {
  const instance = this

  $('[data-tooltip="true"]').tooltip()

  instance.autorun(function () {
    const dtId = Router.current().params._id
    if (!dtId) {
      return
    }

    let subscription = instance.subscribe('servicesDatatableRows.all', { channel: dtId })

    if (subscription.ready()) {

    }
  })
})

Template.servicesDatatableDetailsView.events({
  'click #records-add': (event, tpl) => {
    event.preventDefault()
    Meteor.call('s-datatable-record-add', {
      channel: Router.current().params._id
    }, (error, result) => {
    })
  }
})

Template.sDTRecord.events({
  'blur [contenteditable=true]': (event, tpl) => {
    const isChanged = event.target.getAttribute('data-changed') === 'true'
    if (!isChanged) {
      return
    }
    let v = event.target.innerText.trim()
    Meteor.call('s-datatable-record-edit', {
      channel: Router.current().params._id,
      column: event.target.getAttribute('data-column'),
      value: v,
      record: event.target.getAttribute('data-record')
    }, (error, result) => {
      event.target.setAttribute('data-changed', false)
      event.target.innerHTML = ''
    })
  },
  'focus [contenteditable=true]': (event, tpl) => {
    // set contenteditable caret cursor in the last position of the text.
    // this works when changing from editable to editable by pressing tab
    let el = event.target
    let range = document.createRange()
    let sel = window.getSelection()
    range.setStart(el.childNodes[0], el.innerText.length)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
    el.focus()
  },
  'click .sdt-record-remove': (event, tpl) => {
    event.preventDefault()
    swal({
      title: i18n.__('s-datatable.one.edit.record.removeTitle'),
      text: i18n.__('s-datatable.one.edit.record.removeDescription'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      animation: false
    })
      .then(accepted => {
        if (accepted) {
          Meteor.call('s-datatable-record-remove', {
            channel: Router.current().params._id,
            _id: tpl.data._id
          }, (error, result) => {
            if (error) {
              sAlert.error(i18n.__('s-datatable.one.edit.record.removeError'))
              return
            }
          })
        } 
      })
  },
  'input [contenteditable=true]': (event, tpl) => {
    event.target.setAttribute('data-changed', true)
  }
})

Template.sDTColumnDropdown.events({
  'click #sdt-column-remove': (event, tpl) => {
    event.preventDefault()
    swal({
      title: i18n.__('s-datatable.one.edit.columns.removeTitle'),
      text: i18n.__('s-datatable.one.edit.columns.removeDescription'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      animation: false
    })
      .then(accepted => {
        if (accepted) {
          Meteor.call('s-datatable-column-remove', {
            channel: Router.current().params._id,
            column: tpl.data.name
          }, (error, result) => {
            if (error) {
              sAlert.error(i18n.__('s-datatable.one.edit.columns.removeError'))
              return
            }
          })
        } 
      })
  },

  'click #sdt-column-rename': (event, tpl) => {
    event.preventDefault()
    swal({
      title: i18n.__('s-datatable.one.edit.columns.renameTitle'),
      text: i18n.__('s-datatable.one.edit.columns.renameDescription'),
      buttons: true,
      content: 'input',
      animation: false
    })
      .then(value => {
        if (value.trim() !== '') {
          Meteor.call('s-datatable-column-rename', {
            channel: Router.current().params._id,
            column: tpl.data.name,
            label: value.trim()
          }, (error, result) => {
            if (error) {
              sAlert.error(i18n.__('s-datatable.one.edit.columns.renameError'))
              return
            }
          })
        } 
      })
  }
})

Template.sDTActionsColumnDropdown.events({
  'click #sdt-columns-add': (event, tpl) => {
    event.preventDefault()
    swal({
      title: i18n.__('s-datatable.one.edit.columns.addTitle'),
      content: 'input',
      buttons: true,
      animation: false
    })
      .then(value => {
        if (value.trim() !== '') {
          Meteor.call('s-datatable-columns-add', {
            channel: Router.current().params._id,
            column: value.trim()
          }, (error, result) => {
            if (error) {
              sAlert.error(i18n.__('s-datatable.one.edit.columns.addError'))
              return
            }
            $('[data-tooltip="true"]').tooltip()
          })
        } 
      })
  }
})