import { Template } from 'meteor/templating'

const slugify = require('slugify')
const uuidv4 = require('uuid/v4')

const download = (text, name, type) => {
  var file = new Blob([text], {type: type});
  var isIE = /*@cc_on!@*/false || !!document.documentMode;
  if (isIE)
  {
      window.navigator.msSaveOrOpenBlob(file, name);
  }
  else
  {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(file);
      a.download = name;
      a.click();
  }
}

Template.downloadPostman.events({
  'click': (event, template) => {
    const d = template.data
    const path = $(d['subfix-val']).val()
    const url = `${d['prefix-text']}${d.text}${path}`
    Meteor.call('s-endpoint.postman', slugify(path), url, (error, result) => {
      if (error) return;
      download(result.toString(), slugify(path), 'application/json');
    })
  }
})

Template.triggerEditorEndpointEventNewContent.onRendered(function() {
  const trigger = this.data.flow ? this.data.flow.trigger : {}
  if (!(trigger.config || {}).endpoint) {
    $('[name="trigger.config.endpoint"]').val(uuidv4())
  }
})