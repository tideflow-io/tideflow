const slugify = require('slugify')

import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'

const fileTypes = require('../../fileTypes')

const guessAceMethod = (fileName) => {
  const ext = fileName.split('.').pop()
  const compatibleMode = fileTypes.aceSupportedMethods.find(sm => sm.extensions.includes(ext))
  return `ace/mode/${compatibleMode ? compatibleMode.method : 'text'}`
}

const setMode = (fileName) => {
  const ext = slugify(fileName).toLowerCase()
  let newAceMethod = guessAceMethod(ext)
  ace.edit('editor').session.setMode(newAceMethod)
}

Template['files.new'].onRendered(function() {
  // eslint-disable-next-line no-undef
  var editor = ace.edit('editor', {
    selectionStyle: 'text'
  })

  editor.setOptions({
    tabSize: 2,
    useSoftTabs: true,
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

  if (window.location.hash) {
    Meteor.call('files.getTemplate', window.location.hash.replace('#', ''), (error, result) => {
      if (!error) editor.setValue(result.content)
      editor.clearSelection()
      editor.focus()
      setMode(result.fileName)
      $('#filename').val(result.fileName)
    })
  }
  else {
    editor.focus()
  }
})

Template['files.new'].events({
  'blur #filename': (event, template) => {
    event.target.value = slugify(event.target.value).toLowerCase()
    setMode(event.target.value)
  },
  'keyup #filename': (event, template) => {
    setMode(event.target.value)
  }
})
