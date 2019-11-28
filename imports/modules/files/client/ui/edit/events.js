import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Router } from 'meteor/iron:router'
import { sAlert } from 'meteor/juliancwirko:s-alert'
import i18n from 'meteor/universe:i18n'

const slugify = require('slugify')

const fileTypes = require('../../fileTypes')

const guessAceMethod = (fileName) => {
  const ext = fileName.split('.').pop()
  const compatibleMode = fileTypes.aceSupportedMethods.find(sm => sm.extensions.includes(ext))
  return `ace/mode/${compatibleMode ? compatibleMode.method : 'text'}`
}

const aceSupportedByType = (type) => {
  return fileTypes.aceSupportedMethods.find(sm => sm.mimes.includes(type))
}

Template['files.one.edit'].onRendered(function() {
  // eslint-disable-next-line no-undef
  var editor = ace.edit('editor', {
    selectionStyle: 'text'
  })

  editor.setOptions({
    autoScrollEditorIntoView: true,
    copyWithEmptySelection: true,
  })
  // use setOptions method
  editor.setOption('mergeUndoDeltas', 'always')
  editor.resize()

  editor.setTheme('ace/theme/solarized_dark')
  editor.setFontSize('14px')
  editor.session.setMode('ace/mode/javascript')

  editor.getSession().on('change', function() {
    // eslint-disable-next-line no-undef
    let c = ace.edit('editor').getValue()
    $('[name="content"]').val(c)
  })
  
  const { _id, type, userCreated } = this.data.file
  
  if (userCreated || aceSupportedByType(type)) {
    HTTP.call('GET', `/file?_id=${_id}`, {
      headers: {
        t: localStorage.getItem('Meteor.loginToken'),
        u: Meteor.userId()
      }
    }, (error, result) => {
      if (!error) editor.setValue(result.content)
      editor.clearSelection()
    })
  }
  else {
    alert('File can not be edited')
    Router.go('files.index')
  }
})

Template['files.one.edit'].events({
  'blur #filename': (event, template) => {
    event.target.value = slugify(event.target.value).toLowerCase()
    let newAceMethod = guessAceMethod(event.target.value)
    // eslint-disable-next-line no-undef
    ace.edit('editor').session.setMode(newAceMethod)
  },
  'keyup #filename': (event, template) => {
    const ext = slugify(event.target.value).toLowerCase()
    let newAceMethod = guessAceMethod(ext)
    // eslint-disable-next-line no-undef
    ace.edit('editor').session.setMode(newAceMethod)
  },
  'click .delete-file': (event, template) => {
    event.stopPropagation()
    event.preventDefault()
    swal({
      title: i18n.__('files.delete.title'),
      text: i18n.__('files.delete.text'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      animation: false
    })
      .then(accepted => {
        if (accepted) {
          Meteor.call('files.delete', {
            _id: template.data.file._id
          }, (error) => {
            if (error) {
              sAlert.error(i18n.__('files.delete.error'))
              return
            }
            sAlert.success(i18n.__('files.delete.success'))
            Router.go('files.index')
          })
        }
      })
  }
})
