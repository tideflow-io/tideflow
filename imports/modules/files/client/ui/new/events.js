import { Template } from 'meteor/templating'

const slugify = require('slugify')

const aceSupportedMethods = [
  { method: 'javascript', extensions: ['javascript', 'js'] },
  { method: 'text', extensions: ['txt'] },
  { method: 'markdown', extensions: ['markdown', 'md'] }
]

const guessAceMethod = (fileName) => {
  const ext = fileName.split('.').pop()
  const compatibleMode = aceSupportedMethods.find(sm => sm.extensions.includes(ext))
  return `ace/mode/${compatibleMode ? compatibleMode.method : 'text'}`
}

Template['files.new'].onRendered(function() {
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
})

Template['files.new'].events({
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
  }
})
